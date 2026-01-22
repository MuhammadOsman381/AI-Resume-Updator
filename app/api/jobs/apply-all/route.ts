import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, jobs, cvs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { GenerateImprovedCV, GenerateProfessionalEmail } from "@/services/LangchainService";
import chromium from "@sparticuz/chromium";
import ejs from "ejs";
import path from "path";

import puppeteerCore from "puppeteer-core";
import puppeteer from "puppeteer"; // ONLY used locally
import { decodeToken } from "@/services/JwtService";
import { sendEmail } from "@/services/NodeMailerService";


const remoteExecutablePath =
    "https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar";


export async function POST(req: Request) {
    const { cvId, template } = await req.json();

    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
        return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const user = decodeToken(authHeader);

    if (!user || !user.id) {
        return NextResponse.json({ status: "error", message: "Invalid token" }, { status: 401 });
    }

    if (!cvId || !template) {
        return NextResponse.json({ message: "All fields are required", status: 400 });
    }

    const userRecord = await db
        .select()
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

    if (userRecord.length === 0) {
        return NextResponse.json({ message: "User not found", status: 404 });
    }

    const jobsRecord = await db
        .select()
        .from(jobs)
        .where(eq(jobs.userId, userRecord[0].id));

    const cv = await db
        .select()
        .from(cvs)
        .where(eq(cvs.id, cvId))
        .limit(1);
    if (cv.length === 0) {
        return NextResponse.json({ message: "CV not found", status: 404 });
    }
    const templatePath = path.join(process.cwd(), "templates", "cv", `${template}.ejs`);
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
    for (const job of jobsRecord) {
        if (job.status === "applied") continue; // skip applied jobs
        const improvedCVJSON = await GenerateImprovedCV(cv[0].cvJson, job.description as string);
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
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });
        const pdfBuffer: any = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" },
        });
        await page.close();
        const email = await GenerateProfessionalEmail(
            job.title as string,
            job.description as string,
            userRecord[0].name as string,
            improvedCVJSON
        );
        for (const recipient of job.emails) {
            await sendEmail(recipient, email.subject, email.body, pdfBuffer, userRecord[0].name as string, userRecord[0].email);
        }
        await db.update(jobs).set({ status: "applied" }).where(eq(jobs.id, job.id));
    }

    await browser.close();

    return NextResponse.json({ status: "ok", message: "Processed all pending jobs successfully" });
}
