import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { processSingleApplication } from "@/services/Workers";

export const runtime = "nodejs";
export const maxDuration = 1000;

export const POST = verifySignatureAppRouter(
  async (req: Request) => {
    const { payload, userId } = await req.json();

    console.log("QStash worker hit", userId);

    await processSingleApplication(payload, userId);

    return Response.json({ ok: true });
  }
);
    