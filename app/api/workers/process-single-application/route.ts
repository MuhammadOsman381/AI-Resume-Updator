import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { processSingleApplication } from "@/services/Workers";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes

export const POST = verifySignatureAppRouter(
  async (req: Request) => {
    const { payload, userId } = await req.json();

    await processSingleApplication(payload, userId);

    return Response.json({ success: true });
  }
);
