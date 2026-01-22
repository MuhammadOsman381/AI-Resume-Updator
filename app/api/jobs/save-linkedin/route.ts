import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, jobs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    const { title, description, emails, email } = await req.json();

    if (!title || !description || !Array.isArray(emails) || emails.length === 0) {
        return NextResponse.json(
            { message: "Invalid input" },
            { status: 400 }
        );
    }

    const user = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    if (user.length === 0) {
        return NextResponse.json(
            { message: "User not found" },
            { status: 404 }
        );
    }

    await db.insert(jobs).values({
        title: title,
        description: description,
        emails: emails,
        userId: user[0].id
    })

    return NextResponse.json({ status: "ok", message: "Job saved successfully" });
}
