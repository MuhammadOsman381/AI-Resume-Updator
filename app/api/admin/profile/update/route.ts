import { NextResponse } from "next/server";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import cloudinary from "@/lib/cloudinary";

const hashPassword = (password: string) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

export async function POST(req: Request) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });

    try {
        const decoded: any = jwt.verify(authHeader, process.env.JWT_SECRET!);
        if (!decoded || decoded.role !== 'admin') throw new Error("Invalid session");

        const formData = await req.formData();
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const imageFile = formData.get("image") as File;

        const updateData: any = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (password) updateData.password = hashPassword(password);

        if (imageFile) {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64Image = `data:${imageFile.type};base64,${buffer.toString("base64")}`;
            const uploadResponse = await cloudinary.uploader.upload(base64Image, { folder: "admin-profiles" });
            updateData.image = uploadResponse.secure_url;
        }

        await db.update(admins).set(updateData).where(eq(admins.id, decoded.id));

        const updatedAdmin = await db.select().from(admins).where(eq(admins.id, decoded.id)).limit(1);

        return NextResponse.json({
            status: "ok",
            admin: {
                id: updatedAdmin[0].id,
                name: updatedAdmin[0].name,
                email: updatedAdmin[0].email,
                image: updatedAdmin[0].image
            }
        });
    } catch (error: any) {
        return NextResponse.json({ status: "error", message: error.message }, { status: 401 });
    }
}
