import { NextResponse } from "next/server";
import { tasks, task } from "@trigger.dev/sdk";

// --------------------
// Dummy JWT decode service
// --------------------
function decodeToken(token: string) {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
    return { id: payload.id };
  } catch {
    return null;
  }
}

// --------------------
// Heavy long-running worker
// --------------------
async function processSingleApplication(body: any, userId: string) {
  console.log("Starting application for user:", userId);

  // Simulate 5-minute task
  await new Promise((resolve) => setTimeout(resolve, 5 * 60 * 1000));

  // Replace with your Puppeteer / LangChain / Email logic
  console.log("Finished application for user:", userId);
}

// --------------------
// Trigger.dev task (defined inline)
// --------------------
const processSingleApplicationTask = task({
  id: "process-single-application",
  run: async (payload: { body: any; userId: string }) => {
    await processSingleApplication(payload.body, payload.userId);
  },
});

// --------------------
// Next.js API Route
// --------------------
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

  // Trigger background job
  const handle = await tasks.trigger("process-single-application", {
    body,
    userId: user.id,
  });

  return NextResponse.json({
    status: "processing",
    message: "Job applying process started. This may take a few minutes.",
    runId: handle.id,
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
