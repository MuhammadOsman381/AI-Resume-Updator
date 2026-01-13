import { NextResponse } from "next/server";
import { db } from "@/db";
import { cvs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { decodeToken } from "@/services/JwtService";
import puppeteer from "puppeteer-core";
import ejs from "ejs";
import path from "path";
import os from "os";
import fs from "fs";

// Helper: Cross-platform Puppeteer launcher
async function getBrowser() {
  let executablePath: string | undefined;

  if (process.env.CHROME_PATH) {
    executablePath = process.env.CHROME_PATH;
  } else {
    const platform = os.platform();
    if (platform === "darwin") {
      const macPath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
      if (fs.existsSync(macPath)) executablePath = macPath;
    } else if (platform === "win32") {
      const winPath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
      if (fs.existsSync(winPath)) executablePath = winPath;
    } else if (platform === "linux") {
      const linuxPath = "/usr/bin/google-chrome"; // Vercel/Ubuntu default
      if (fs.existsSync(linuxPath)) executablePath = linuxPath;
    }
  }

  // Fallback to Puppeteer's bundled Chromium
  if (!executablePath) {
    const puppeteerModule = await import("puppeteer");
    return await puppeteerModule.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  return await puppeteer.launch({
    headless: true,
    executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}

export async function GET(req: Request) {
  // --- Auth ---
  const authHeader = req.headers.get("authorization");
  if (!authHeader)
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });

  const user = decodeToken(authHeader);
  if (!user?.id)
    return NextResponse.json({ status: "error", message: "Invalid token" }, { status: 401 });

  // --- Parse CV ID & Template ---
  const urlParts = req.url.split("/");
  const cvID = urlParts[urlParts.length - 2];
  const template = urlParts[urlParts.length - 1];

  // --- Fetch CV ---
  const result = await db
    .select()
    .from(cvs)
    .where(and(eq(cvs.userId, user.id), eq(cvs.id, cvID)));

  if (!result.length)
    return NextResponse.json({ status: "error", message: "CV not found" }, { status: 404 });

  const cv = result[0];
  const cvData: any = cv.cvJson;

  // --- Render EJS template ---
  const templatePath = path.join(process.cwd(), "templates", "cv", `${template}.ejs`);

  const html = await ejs.renderFile(templatePath, {
    name: cvData.name,
    position: cvData.position,
    links: cvData.links,
    summary: cvData.summary,
    tech_stack: cvData.tech_stack,
    experience: cvData.experience,
    projects: cvData.projects,
    education: cvData.education,
  });

  // --- Launch browser (cross-platform) ---
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  // --- Generate PDF ---
  const pdfBuffer: any = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" },
  });

  await browser.close();

  // --- Return PDF response ---
  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${cv.title}-${template}.pdf"`,
    },
  });
}
