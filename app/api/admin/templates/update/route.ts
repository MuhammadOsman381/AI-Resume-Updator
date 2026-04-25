import { NextResponse } from "next/server";
import { db } from "@/db";
import { templates } from "@/db/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });

    try {
        const decoded: any = jwt.verify(authHeader, process.env.JWT_SECRET!);
        if (!decoded || decoded.role !== 'admin') throw new Error("Invalid session");

        const formData = await req.formData();
        const id = formData.get("id") as string;
        const title = formData.get("title") as string;
        const ejs = formData.get("ejs") as string;
        const imageFile = formData.get("image") as File;

        if (!id) throw new Error("ID is required");

        const updateData: any = {};
        if (title) updateData.title = title;
        if (ejs) updateData.ejs = ejs;

        if (imageFile) {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64Image = `data:${imageFile.type};base64,${buffer.toString("base64")}`;
            const uploadResponse = await cloudinary.uploader.upload(base64Image, { folder: "cv-templates" });
            updateData.imageUrl = uploadResponse.secure_url;
        }

        await db.update(templates).set(updateData).where(eq(templates.id, id));

        return NextResponse.json({ status: "ok", message: "Template updated" });
    } catch (error: any) {
        return NextResponse.json({ status: "error", message: error.message }, { status: 401 });
    }
}
