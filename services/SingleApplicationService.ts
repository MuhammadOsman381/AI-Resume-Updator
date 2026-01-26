import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, jobs, cvs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { GenerateImprovedCV, GenerateProfessionalEmail } from "@/services/LangchainService";
import chromium from "@sparticuz/chromium";
import ejs from "ejs";
import path from "path";

import puppeteerCore from "puppeteer-core";
import puppeteer from "puppeteer";
import { decodeToken } from "@/services/JwtService";
import { sendEmail } from "@/services/NodeMailerService";


const remoteExecutablePath =
    "https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar";


export async function step1(
    body: { id: string; cvId: string; template: string },
    userId: string
) {
    const { id, cvId, template } = body;

    const job = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
    const cv = await db.select().from(cvs).where(eq(cvs.id, cvId)).limit(1);
    const userRecord = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!job.length || !cv.length || !userRecord.length) {
        throw new Error("Job, CV or User not found");
    }

    const improvedCVJSON = await GenerateImprovedCV(
        cv[0].cvJson,
        job[0].description as string
    );

    return { job: job[0], cv: cv[0], user: userRecord[0], improvedCVJSON, template }

}


export async function step2(
    job: any,
    user: any,
    improvedCVJSON: any,
    template: string
) {

    const email = await GenerateProfessionalEmail(
        job.title as string,
        job.description as string,
        user.name as string,
        improvedCVJSON
    );

    return {
        job,
        user,
        improvedCVJSON,
        email,
        template
    }
}

export async function step3(
    job: any,
    user: any,
    improvedCVJSON: any,
    email: { body: string, subject: string },
    template: string
) {

    const templatePath = path.join(
        process.cwd(),
        "templates",
        "cv",
        `${template}.ejs`
    );

    const html: any = await ejs.renderFile(templatePath, {
        ...improvedCVJSON
    });

    const browser =
        process.env.PUPPETEER === "local"
            ? await puppeteer.launch({ headless: true })
            : await puppeteerCore.launch({
                args: chromium.args,
                executablePath: await chromium.executablePath(remoteExecutablePath),
                headless: true
            });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" }
    });

    await browser.close();

    for (const recipient of job.emails) {
        await sendEmail(
            recipient,
            email.subject,
            email.body,
            Buffer.from(pdfBuffer),
            user.name as string,
            user.email as string
        );
    }
    await db.update(jobs).set({ status: "applied" }).where(eq(jobs.id, job.id));
}

