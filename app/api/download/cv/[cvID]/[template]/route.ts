import { NextResponse } from "next/server";
import { db } from "@/db";
import { cvs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { decodeToken } from "@/services/JwtService";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";
import ejs from "ejs";
import path from "path";

export async function GET(req: Request) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
        return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const user = decodeToken(authHeader);
    if (!user?.id) {
        return NextResponse.json({ status: "error", message: "Invalid token" }, { status: 401 });
    }

    const urlParts = req.url.split("/");
    const cvID = urlParts[urlParts.length - 2];
    const template = urlParts[urlParts.length - 1];

    const result = await db
        .select()
        .from(cvs)
        .where(and(eq(cvs.userId, user.id), eq(cvs.id, cvID)));

    if (!result.length) {
        return NextResponse.json({ status: "error", message: "CV not found" }, { status: 404 });
    }

    const cv = result[0];
    const cvData: any = cv.cvJson;

    const templatePath = path.join(
        process.cwd(),
        "templates",
        "cv",
        `${template}.ejs`
    );

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


    const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(), // must await
        headless: true,              // true or false
    });

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
            "Content-Disposition": `attachment; filename="${cv.title}-${template}.pdf"`,
        },
    });
}
