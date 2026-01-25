import { task } from "@trigger.dev/sdk";
import { db } from "@/db";
import { users, jobs, cvs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { GenerateImprovedCV, GenerateProfessionalEmail } from "@/services/LangchainService";
import chromium from "@sparticuz/chromium";
import ejs from "ejs";
import path from "path";
import puppeteerCore from "puppeteer-core";
import puppeteer from "puppeteer";
import { sendEmail } from "@/services/NodeMailerService";

const remoteExecutablePath = "https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar";

export const processSingleApplicationTask = task({
  id: "process-single-application",
  run: async (payload: { body: { id: string; cvId: string; template: string }; userId: string }) => {
    const { body, userId } = payload;
    const { id, cvId, template } = body;

    const job = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
    const cv = await db.select().from(cvs).where(eq(cvs.id, cvId)).limit(1);
    const userRecord = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!job.length || !cv.length || !userRecord.length) throw new Error("Job, CV or User not found");

    const improvedCVJSON = await GenerateImprovedCV(cv[0].cvJson, job[0].description as string);
    const templatePath = path.join(process.cwd(), "templates", "cv", `${template}.ejs`);
    const html = await ejs.renderFile(templatePath, { ...improvedCVJSON });

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

    const email = await GenerateProfessionalEmail(
      job[0].title as string,
      job[0].description as string,
      userRecord[0].name as string,
      improvedCVJSON
    );

    for (const recipient of job[0].emails) {
      await sendEmail(
        recipient,
        email.subject,
        email.body,
        Buffer.from(pdfBuffer),
        userRecord[0].name as string,
        userRecord[0].email as string
      );
    }

    await db.update(jobs).set({ status: "applied" }).where(eq(jobs.id, job[0].id));
    console.log(`Job ${job[0].id} processed successfully.`);
  }
});
