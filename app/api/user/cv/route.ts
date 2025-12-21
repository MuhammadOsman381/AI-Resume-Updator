import { decodeToken } from "@/services/JwtService";
import { ParseCV } from "@/services/LangchainService";
import { GetText } from "@/services/PdfService";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { cvs } from "@/db/schema";
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
    const userCvs = await db
        .select()
        .from(cvs)
        .where(eq(cvs.userId, user.id));
    return NextResponse.json({
        status: "ok",
        data: userCvs,
    });
}