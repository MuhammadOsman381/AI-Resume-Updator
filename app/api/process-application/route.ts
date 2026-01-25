import { processSingleApplication } from "@/services/Workers";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { body, userId } = await req.json();
  await processSingleApplication(body, userId);
  return new Response("done", { status: 200 });
}
