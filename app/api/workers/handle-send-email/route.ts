import { handleSendEmailAndJobUpdation } from "@/services/SingleApplicationService";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
  console.log("Worker 3 started processing");

    const { email, job, pdfBuffer, userRecord } = await req.json();

    

    // Directly process email and job updation
    const result = await handleSendEmailAndJobUpdation(email, job, pdfBuffer, userRecord);

    return new Response(JSON.stringify({ ok: result }), { status: 200 });
  } catch (error) {
    console.error("Failed to process email and job updation", error);
    return new Response(
      JSON.stringify({ ok: false, message: "Failed to process job" }),
      { status: 500 }
    );
  }
}
