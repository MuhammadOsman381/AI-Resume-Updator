import { decodeToken } from "@/services/JwtService";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { cvs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import puppeteerCore from "puppeteer-core";
import puppeteer from "puppeteer"; // ONLY used locally
import chromium from "@sparticuz/chromium-min";
import ejs from "ejs";
import path from "path";

const remoteExecutablePath =
    "https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar";

export async function POST(req: Request) {
    const authHeader = req.headers.get("authorization");
    const { cvID, coverLetter, companyName } = await req.json();

    if (!authHeader) {
        return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const user = decodeToken(authHeader);
    if (!user || !user.id) {
        return NextResponse.json({ status: "error", message: "Invalid token" }, { status: 401 });
    }

    const cvData = await db
        .select()
        .from(cvs)
        .where(and(eq(cvs.userId, user.id), eq(cvs.id, cvID)))
        .limit(1);

    if (!cvData.length) {
        return NextResponse.json({ status: "error", message: "CV not found" }, { status: 404 });
    }

    const cv = cvData[0].cvJson;

    const templatePath = path.join(
        process.cwd(),
        "templates",
        "cover-letter.ejs"
    );

    const html = await ejs.renderFile(templatePath, {
        name: cv.name || "Applicant",
        links: cv.links || [],
        companyName: companyName || "The Company",
        coverLetter: coverLetter,
    });

    let browser;
    if (process.env.PUPPETEER === "local") {
        browser = await puppeteer.launch({
            headless: true,
        });
    } else {
        browser = await puppeteerCore.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath(remoteExecutablePath),
            headless: true,
        });
    }

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer: any = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
            top: "20mm",
            bottom: "20mm",
            left: "20mm",
            right: "20mm",
        },
    });

    await browser.close();

    return new Response(pdfBuffer, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="cover-letter-${companyName}.pdf"`,
        },
    });
}
