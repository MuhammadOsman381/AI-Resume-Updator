import { NextResponse } from "next/server";
import { db } from "@/db";
import { admins } from "@/db/schema";
import crypto from 'crypto';

const hashPassword = (password: string) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

export async function GET() {
    try {
        const existingAdmins = await db.select().from(admins).limit(1);

        if (existingAdmins.length > 0) {
            return NextResponse.json({ status: "error", message: "System already initialized. Admin exists." }, { status: 400 });
        }

        const defaultAdmin = {
            name: "Super Admin",
            email: "admin@admin.com",
            password: hashPassword("admin123"),
            image: "https://ui-avatars.com/api/?name=Admin&background=random"
        };

        await db.insert(admins).values(defaultAdmin as any);

        return NextResponse.json({
            status: "ok",
            message: "System initialized successfully. Login with admin@admin.com / admin123"
        });
    } catch (error: any) {
        console.error("Seed Error:", error);
        return NextResponse.json({ status: "error", message: "Seeding failed" }, { status: 500 });
    }
}
