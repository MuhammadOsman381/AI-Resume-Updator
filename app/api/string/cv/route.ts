import { decodeToken } from "@/services/JwtService";
import { ParseCV } from "@/services/LangchainService";
import { GetText } from "@/services/PdfService";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { cvs } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
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
    const { title, cvString } = await req.json();

    if (!title || !cvString) {
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
                eq(cvs.title, title)
            )
        )
        .limit(1);

    if (existingCv.length > 0) {
        return NextResponse.json({
            status: "error",
            message: "CV with this title already exists.",
        });
    }
    
    const json = await ParseCV(cvString);

    const userCV = await db.insert(cvs).values({
        userId: user.id,
        title,
        cvJson: json,
    });
    return NextResponse.json({
        status: "ok",
        title,
        userCV: userCV,
        message: "CV/Resume uploaded successfully",
    });
}
