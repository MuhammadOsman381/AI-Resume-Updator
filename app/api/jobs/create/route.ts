import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, jobs, cvs } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
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
    const { title, description, emails } = await req.json();

    const authHeader = req.headers.get("authorization");

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

    if (!title || !description || emails.length === 0) {
        return NextResponse.json(
            { message: "All fields are required" },
            { status: 400 }
        );
    }

    const newJob =  await db.insert(jobs).values({
        userId: user.id,
        title,
        description,
        emails: emails,
        status: "pending",
    });

    return NextResponse.json({ status: "ok", message: "Job created successfully" });
}
