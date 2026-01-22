import axios from "axios";
import { handleEmail } from "@/services/SingleApplicationService";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  const { userId, pdfBuffer, job, improvedCVJSON } = await req.json();
  console.log("Worker hit", userId);

  // Handle email preparation
  const { email, userRecord } = await handleEmail(
    userId,
    pdfBuffer.data,
    job,
    improvedCVJSON
  );

  try {
    // Directly call the email worker API using axios
     axios.post(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/workers/handle-send-email`,
      {
        email,
        job,
        pdfBuffer,
        userRecord,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 300_000, // 5 minutes
      }
    );
  } catch (error) {
    console.error("Failed to call handle-send-email API", error);
    return new Response(
      JSON.stringify({ ok: false, message: "Failed to send email" }),
      { status: 500 }
    );
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
