// pages/api/queueStep2.ts
import { NextResponse } from "next/server";
import { Client } from "@upstash/qstash";
import { step2 } from "@/services/SingleApplicationService";

const qstash = new Client({ token: process.env.QSTASH_TOKEN! });

export async function POST(req: Request) {
  const body = await req.json();

  try {
    const { email } = await step2(body.job, body.user, body.improvedCVJSON, body.template);

    if (!email) throw new Error("Step2 did not return email");

    await qstash.publishJSON({
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/jobs/queues/queue2`,
      body: { ...body, email },
      retries: 3,
    });

    return NextResponse.json({ message: "Step2 completed and queued Step3" });
  } catch (err) {
    console.error("Step2 error:", err);
    return NextResponse.json({ message: "Step2 failed" }, { status: 500 });
  }
}
