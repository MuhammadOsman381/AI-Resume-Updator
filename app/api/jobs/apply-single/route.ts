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

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes


export async function POST(req: Request) {
  const body = await req.json();
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = decodeToken(authHeader);
  if (!user?.id) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  // 🚀 Fire-and-forget
  processApplication(body, user.id).catch(console.error);

  return NextResponse.json({
    status: "processing",
    message: "Application started"
  });
}
async function processApplication(body: any, id: string) {
    throw new Error("Function not implemented.");
}

