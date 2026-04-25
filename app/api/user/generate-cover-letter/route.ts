import { decodeToken } from "@/services/JwtService";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { cvs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { GenerateCoverLetter } from "@/services/LangchainService";

export async function POST(req: Request) {
    const authHeader = req.headers.get("authorization");
    const { cvID, jobTitle, companyName, jobDescription } = await req.json();

    if (!authHeader) {
        return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const user = decodeToken(authHeader);
    if (!user || !user.id) {
        return NextResponse.json({ status: "error", message: "Invalid token" }, { status: 401 });
    }

    if (!cvID) {
        return NextResponse.json({ status: "error", message: "cvID is required" }, { status: 400 });
    }

    const cvData = await db
        .select()
        .from(cvs)
        .where(and(eq(cvs.userId, user.id), eq(cvs.id, cvID)))
        .limit(1);

    if (!cvData.length) {
        return NextResponse.json({ status: "error", message: "CV not found" }, { status: 404 });
    }

    try {
        const result = await GenerateCoverLetter(cvData[0].cvJson, jobTitle, companyName, jobDescription);
        return NextResponse.json({
            status: "ok",
            coverLetter: result.coverLetter,
        });
    } catch (error: any) {
        console.error("Cover letter generation failed", error);
        return NextResponse.json({ status: "error", message: error.message || "Failed to generate cover letter" }, { status: 500 });
    }
}
