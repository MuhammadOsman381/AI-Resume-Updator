import { decodeToken } from "@/services/JwtService";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { cvs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { CheckATSScore } from "@/services/LangchainService";

export async function POST(req: Request) {
    const authHeader = req.headers.get("authorization");
    const { cvID, jobDescription } = await req.json();

    if (!authHeader) {
        return NextResponse.json(
            { status: "error", message: "Unauthorized" },
            { status: 401 }
        );
    }

    const user = decodeToken(authHeader);
    if (!user || !user.id) {
        return NextResponse.json(
            { status: "error", message: "Invalid token" },
            { status: 401 }
        );
    }

    if (!cvID) {
        return NextResponse.json(
            { status: "error", message: "cvID is required" },
            { status: 400 }
        );
    }

    const cv = await db
        .select()
        .from(cvs)
        .where(
            and(
                eq(cvs.userId, user.id),
                eq(cvs.id, cvID)
            )
        )
        .limit(1);

    if (cv.length === 0) {
        return NextResponse.json(
            { status: "error", message: "CV not found" },
            { status: 404 }
        );
    }

    try {
        const atsResult = await CheckATSScore(cv[0].cvJson, jobDescription);

        return NextResponse.json({
            status: "ok",
            atsResult,
            message: "ATS Score calculated successfully",
        });
    } catch (error: any) {
        console.error("ATS Score calculation failed", error);
        return NextResponse.json(
            { status: "error", message: error.message || "Failed to calculate ATS score" },
            { status: 500 }
        );
    }
}
