import { NextResponse } from "next/server";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import crypto from 'crypto';

const hashPassword = (password: string) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ status: "error", message: "Email and password are required" }, { status: 400 });
        }

        const adminRecord = await db
            .select()
            .from(admins)
            .where(eq(admins.email, email))
            .limit(1);

        if (!adminRecord.length) {
            return NextResponse.json({ status: "error", message: "Invalid credentials" }, { status: 401 });
        }

        const admin = adminRecord[0];
        const hashedPassword = hashPassword(password);

        if (admin.password !== hashedPassword) {
            return NextResponse.json({ status: "error", message: "Invalid credentials" }, { status: 401 });
        }

        const token = jwt.sign(
            { id: admin.id, email: admin.email, name: admin.name, role: 'admin' },
            process.env.JWT_SECRET!,
            { expiresIn: "1d" }
        );

        return NextResponse.json({
            status: "ok",
            token,
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                image: admin.image
            }
        });
    } catch (error: any) {
        console.error("Login Error:", error);
        return NextResponse.json({ status: "error", message: "An unexpected error occurred" }, { status: 500 });
    }
}
