import { NextResponse } from "next/server";
import puppeteerCore from "puppeteer-core";
import puppeteer from "puppeteer";
import chromium from "@sparticuz/chromium-min";
import ejs from "ejs";
import path from "path";

const remoteExecutablePath =
    "https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar";

export async function POST(req: Request) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
        return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    // You may verify token if needed
    // const user = decodeToken(authHeader);

    const { cvData, template, title } = await req.json();

    if (!cvData || !template) {
        return NextResponse.json({ status: "error", message: "Missing data" }, { status: 400 });
    }

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

    let browser;

    if (process.env.PUPPETEER === "local") {
        browser = await puppeteer.launch({ headless: true });
    } else {
        browser = await puppeteerCore.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath(remoteExecutablePath),
            headless: true,
        });
    }

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" },
    });

    await browser.close();

    return new Response(pdfBuffer as any, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${title || "cv"}-${template}.pdf"`,
        },
    });
}
