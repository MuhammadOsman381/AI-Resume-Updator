import { NextResponse } from "next/server";
import { db } from "@/db";
import { templates } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
    try {
        const result = await db
            .select()
            .from(templates)
            .orderBy(desc(templates.createdAt));

        return NextResponse.json({
            status: "ok",
            templates: result,
        });
    } catch (error: any) {
        console.error("Fetch templates error:", error);
        return NextResponse.json({ status: "error", message: "Failed to fetch templates" }, { status: 500 });
    }
}
