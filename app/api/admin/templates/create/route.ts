import { decodeToken } from "@/services/JwtService";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { templates, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
        return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const userToken = decodeToken(authHeader);
    if (!userToken || !userToken.id) {
        return NextResponse.json({ status: "error", message: "Invalid token" }, { status: 401 });
    }

    // Check if user is admin
    const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userToken.id))
        .limit(1);

    if (!user.length || user[0].role !== "admin") {
        return NextResponse.json({ status: "error", message: "Forbidden: Admin access required" }, { status: 403 });
    }

    try {
        const formData = await req.formData();
        const title = formData.get("title") as string;
        const ejsContent = formData.get("ejs") as string;
        const image = formData.get("image") as File;

        console.log(title, ejsContent, image)

        if (!title || !ejsContent || !image) {
            return NextResponse.json({ status: "error", message: "Missing required fields" }, { status: 400 });
        }

        // Convert file to base64
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = `data:${image.type};base64,${buffer.toString("base64")}`;

        // Upload to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(base64Image, {
            folder: "cv-templates",
        });

        // Store in DB
        await db.insert(templates).values({
            title,
            ejs: ejsContent,
            imageUrl: uploadResponse.secure_url,
        });

        return NextResponse.json({
            status: "ok",
            message: "Template created successfully",
        });
    } catch (error: any) {
        console.error("Template creation error:", error);
        return NextResponse.json({ status: "error", message: error.message || "Failed to create template" }, { status: 500 });
    }
}
