import { NextResponse } from "next/server";
import { TriggerClient } from "@trigger.dev/sdk";
import { decodeToken } from "@/services/JwtService";
import { processSingleApplication } from "@/services/Workers";

/* ----------------------------------
   Trigger.dev Client
----------------------------------- */
const client = new TriggerClient({
  id: "job-application-system",
  apiKey: process.env.TRIGGER_API_KEY!,
});

/* ----------------------------------
   Trigger.dev Job (same file)
----------------------------------- */
client.defineJob({
  id: "process-single-application",
  name: "Process Single Application",
  version: "1.0.0",

  trigger: client.eventTrigger({
    name: "application.process",
  }),

  run: async (payload, io) => {
    const { body, userId } = payload as {
      body: any;
      userId: string;
    };

    await io.logger.info("Job started", { userId });

    // ⏳ LONG RUNNING TASK (5+ minutes)
    await processSingleApplication(body, userId);

    await io.logger.info("Job completed", { userId });
  },
});

/* ----------------------------------
   Next.js API Route
----------------------------------- */
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json();
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = decodeToken(authHeader);
  if (!user?.id) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  // ✅ Trigger background job
  await client.sendEvent({
    name: "application.process",
    payload: {
      body,
      userId: user.id,
    },
  });

  return NextResponse.json({
    status: "processing",
    message: "Job applying process started. This may take a few minutes.",
  });
}




// import { NextResponse } from "next/server";
// import axios from "axios";
// import { decodeToken } from "@/services/JwtService";
// import { generateCVBinary } from "@/services/SingleApplicationService";

// export async function POST(req: Request) {
//   const body = await req.json();
//   const authHeader = req.headers.get("authorization");

//   if (!authHeader) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   const user = decodeToken(authHeader);
//   if (!user?.id) {
//     return NextResponse.json({ message: "Invalid token" }, { status: 401 });
//   }

//   // Generate CV binary and other data
//   const { userId, pdfBuffer, job, improvedCVJSON } = await generateCVBinary(body, user.id);


//   try {
//     // Directly call the other API using axios
//     axios.post(
//       `https://ai-resume-enhancer-mu.vercel.app/api/workers/generate-email`,
//       {
//         userId,
//         pdfBuffer,
//         job,
//         improvedCVJSON,
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     ).then(() => {
//       console.log("Successfully called generate-email API");
//     }).catch((error) => {
//       console.error("Error calling generate-email API", error);
//     });
//   } catch (error) {
//     console.error("Failed to call generate-email API", error);
//     return NextResponse.json(
//       { status: "error", message: "Failed to start job" },
//       { status: 500 }
//     );
//   }

//   return NextResponse.json({
//     status: "started",
//     message: "Job applying process started. This may take a few minutes.",
//   });
// }
