import { NextResponse } from "next/server";
import { db } from "@/db";
import { templates } from "@/db/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });

    try {
        const decoded: any = jwt.verify(authHeader, process.env.JWT_SECRET!);
        if (!decoded || decoded.role !== 'admin') throw new Error("Invalid session");

        const { id } = await req.json();
        if (!id) throw new Error("ID is required");

        await db.delete(templates).where(eq(templates.id, id));

        return NextResponse.json({ status: "ok", message: "Template deleted" });
    } catch (error: any) {
        return NextResponse.json({ status: "error", message: error.message }, { status: 401 });
    }
}
