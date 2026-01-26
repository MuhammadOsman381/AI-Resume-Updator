// pages/api/processApplication.ts
import { NextResponse } from "next/server";
import { step1, step2, step3 } from "@/services/SingleApplicationService";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  const body = await req.json();
  const { userId } = body;
  try {
    const { job, cv, user, improvedCVJSON, template } = await step1(body, userId);
    const { email } = await step2(job, user, improvedCVJSON, template);
    await step3(job, user, improvedCVJSON, email, template);

    return NextResponse.json({ message: "Application processed successfully" });
  } catch (err) {
    console.error("Error processing job:", err);
    return NextResponse.json({ message: "Failed to process job" }, { status: 500 });
  }
}
