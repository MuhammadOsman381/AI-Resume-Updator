// pages/api/queueStep3.ts
import { NextResponse } from "next/server";
import { step3 } from "@/services/SingleApplicationService";

export async function POST(req: Request) {
  const body = await req.json();

  try {
    await step3(body.job, body.user, body.improvedCVJSON, body.email, body.template);
    return NextResponse.json({ message: "Step3 completed successfully" });
  } catch (err) {
    console.error("Step3 error:", err);
    return NextResponse.json({ message: "Step3 failed" }, { status: 500 });
  }
}


