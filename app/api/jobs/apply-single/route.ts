// import { NextResponse } from "next/server";
// import { db } from "@/db";
// import { users, jobs, cvs } from "@/db/schema";
// import { eq } from "drizzle-orm";
// import { GenerateImprovedCV, GenerateProfessionalEmail } from "@/services/LangchainService";
// import chromium from "@sparticuz/chromium";
// import ejs from "ejs";
// import path from "path";

// import puppeteerCore from "puppeteer-core";
// import puppeteer from "puppeteer";
// import { decodeToken } from "@/services/JwtService";
// import { sendEmail } from "@/services/NodeMailerService";

// import { processSingleApplication } from "@/services/Workers";

// export const runtime = "nodejs";
// export const maxDuration = 300; // 5 minutes


// export async function POST(req: Request) {
//   const body = await req.json();
//   const authHeader = req.headers.get("authorization");

//   if (!authHeader) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   const user = decodeToken(authHeader);
//   if (!user?.id) {
//     return NextResponse.json({ message: "Invalid token" }, { status: 401 });
//   }

//   // 🚀 Fire-and-forget
//   processSingleApplication(body, user.id).catch(console.error);

//   return NextResponse.json({
//     status: "processing",
//     message: "Job applying process is started this may take a some minutes.",
//   });
// }



import { NextResponse } from "next/server";
import { Client } from "@upstash/qstash";
import { decodeToken } from "@/services/JwtService";

const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
});

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

  // ✅ Send job to QStash
  await qstash.publishJSON({
    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/workers/process-single-application`,
    body: {
      payload: body,
      userId: user.id,
    },
    retries: 3,
    timeout: "300s" 
  });

  return NextResponse.json({
    status: "queued",
    message: "Job applying process started. This may take a few minutes.",
  });
}
