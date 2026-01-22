import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db"; // adjust path
import { cvs, jobs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { decodeToken } from "@/services/JwtService";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
   const { id } = await context.params;

    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = decodeToken(authHeader);
    if (!user?.id) {
      return NextResponse.json(
        { status: "error", message: "Invalid token" },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json({ error: "Job id is required" }, { status: 400 });
    }

    // Delete from database
    const deleted = await db
      .delete(jobs)
      .where(eq(jobs.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Job deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE JOB ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
