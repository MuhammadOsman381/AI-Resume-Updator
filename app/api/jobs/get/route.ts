import { decodeToken } from "@/services/JwtService";
import { ParseCV } from "@/services/LangchainService";
import { GetText } from "@/services/PdfService";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { cvs, jobs } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: Request) {
    const authHeader = req.headers.get("authorization");
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

    const user_jobs = await db
        .select()
        .from(jobs)
        .where(
            eq(jobs.userId, user.id)
        );

    return NextResponse.json({
        status: "ok",
        jobs: user_jobs,
    });
}
