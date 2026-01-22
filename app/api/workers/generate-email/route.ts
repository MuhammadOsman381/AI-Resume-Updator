import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { processSingleApplication } from "@/services/Workers";
import { handleEmail } from "@/services/SingleApplicationService";
import { Client } from "@upstash/qstash";


export const runtime = "nodejs";
export const maxDuration = 300;

const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
});

export const POST = verifySignatureAppRouter(
  async (req: Request) => {
    const { userId, pdfBuffer, job, improvedCVJSON } = await req.json();
    console.log("QStash worker hit", userId);

    const { email, userRecord } = await handleEmail(userId, pdfBuffer.data, job, improvedCVJSON)

    await qstash.publishJSON({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/workers/handle-send-email`,
      body: {
        payload: { email, job, pdfBuffer, userRecord },
      },
      retries: 3,
      timeout: "300s"
    });

    return Response.json({ ok: true });
  }
);

