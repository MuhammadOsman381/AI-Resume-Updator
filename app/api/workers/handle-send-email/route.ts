import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { processSingleApplication } from "@/services/Workers";
import { handleEmail, handleSendEmailAndJobUpdation } from "@/services/SingleApplicationService";
import { Client } from "@upstash/qstash";

export const runtime = "nodejs";
export const maxDuration = 300;

export const POST = verifySignatureAppRouter(
  async (req: Request) => {
    const { email, job, pdfBuffer, userRecord } = await req.json();
    const result = await handleSendEmailAndJobUpdation(email, job, pdfBuffer, userRecord)
    return Response.json({ ok: result });
  }
);


