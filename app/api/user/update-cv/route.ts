import { decodeToken } from "@/services/JwtService";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { cvs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { GenerateImprovedCV } from "@/services/LangchainService";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import ejs from "ejs";
import path from "path";

export async function POST(req: Request) {
    const authHeader = req.headers.get("authorization");
    const { cvID, jobDescription, template } = await req.json();
    if (!authHeader) {
        return NextResponse.json(
            { status: "error", message: "Unauthorized" },
            { status: 401 }
        );
    }
    const user = decodeToken(authHeader);
    if (!user || !user.id) {
        return NextResponse.json(
            { status: "error", message: "Invalid token" },
            { status: 401 }
        );
    }
    if (!cvID) {
        return NextResponse.json(
            { status: "error", message: "cvID is required" },
            { status: 400 }
        );
    }

    const cv = await db
        .select()
        .from(cvs)
        .where(
            and(
                eq(cvs.userId, user.id),
                eq(cvs.id, cvID)
            )
        )
        .limit(1);

    const improvedCVJSON = await GenerateImprovedCV(cv[0].cvJson, jobDescription);

    const templatePath = path.join(
        process.cwd(),
        "templates",
        "cv",
        `${template}.ejs`
    );

    const html = await ejs.renderFile(templatePath, {
        name: improvedCVJSON.name,
        position: improvedCVJSON.position,
        links: improvedCVJSON.links,
        summary: improvedCVJSON.summary,
        tech_stack: improvedCVJSON.tech_stack,
        experience: improvedCVJSON.experience,
        projects: improvedCVJSON.projects,
        education: improvedCVJSON.education,
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
            "Content-Disposition": `attachment; filename="${cv[0].title}-${template}.pdf"`,
        },
    });
}