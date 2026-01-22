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
import axios from "axios";
import { decodeToken } from "@/services/JwtService";
import { generateCVBinary } from "@/services/SingleApplicationService";

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

  // Generate CV binary and other data
  const { userId, pdfBuffer, job, improvedCVJSON } = await generateCVBinary(body, user.id);

  try {
    // Directly call the other API using axios
    axios.post(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/workers/generate-email`,
      {
        userId,
        pdfBuffer,
        job,
        improvedCVJSON,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 300_000, // 5 minutes
      }
    );
  } catch (error) {
    console.error("Failed to call generate-email API", error);
    return NextResponse.json(
      { status: "error", message: "Failed to start job" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    status: "started",
    message: "Job applying process started. This may take a few minutes.",
  });
}
