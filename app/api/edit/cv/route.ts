import { decodeToken } from "@/services/JwtService";
import { ParseCV } from "@/services/LangchainService";
import { GetText } from "@/services/PdfService";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { cvs } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PUT(req: Request) {
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
    const { id, json } = await req.json();

    if (!id || !json) {
        return NextResponse.json({
            status: "error",
            message: "Please fill all fields",
        });
    }

    const existingCv = await db
        .select()
        .from(cvs)
        .where(
            and(
                eq(cvs.userId, user.id),
            )
        )
        .limit(1);

    if (existingCv.length == 0) {
        return NextResponse.json({
            status: "error",
            message: "CV does not exist.",
        });
    }

    const userCV = await db
        .update(cvs)
        .set({
            cvJson: json,
        })
        .where(
            and(
                eq(cvs.userId, user.id),
                eq(cvs.id, id)
            )
        );

    return NextResponse.json({
        status: "ok",
        message: "CV/Resume updated successfully",
    });
}
