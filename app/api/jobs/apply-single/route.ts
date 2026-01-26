// pages/api/queueStep1.ts
import { NextResponse } from "next/server";
import { Client } from "@upstash/qstash";
import { step1 } from "@/services/SingleApplicationService";

const qstash = new Client({ token: process.env.QSTASH_TOKEN! });

export async function POST(req: Request) {
  const body = await req.json();
  const { userId } = body;

  try {
    const { job, cv, user, improvedCVJSON, template } = await step1(body, userId);

    await qstash.publishJSON({
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/queues/queue1`,
      body: { job, cv, user, improvedCVJSON, template },
      retries: 3,
    });

    return NextResponse.json({ message: "Step1 completed and queued Step2" });
  } catch (err) {
    console.error("Step1 error:", err);
    return NextResponse.json({ message: "Step1 failed" }, { status: 500 });
  }
}




// import { NextResponse } from "next/server";
// import { decodeToken } from "@/services/JwtService";
// import { processSingleApplication } from "@/services/Workers";

// export const runtime = "nodejs";
// export const maxDuration = 300; 



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

//   // 🚀 Fire-and-forget
//   processSingleApplication(body, user.id).catch(console.error);

//   return NextResponse.json({
//     status: "processing",
//     message: "Job applying process is started this may take a some minutes.",
//   });
// }





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
