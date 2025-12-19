import { ParseCV } from "@/services/LangchainService";
import { GetText } from "@/services/PdfService";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const formData = await req.formData();
    const title = formData.get("title")?.toString() || "";
    const file = formData.get("file") as File | null;
    if (!file || !title) {
        return NextResponse.json({ status: "error", message: "Please fill all fields" });
    }
    const pdfText = await GetText(file)
    const structuredOutput = await ParseCV(pdfText)
    console.log(structuredOutput);
    return NextResponse.json({ status: "ok", title, fileName: file?.name, message: "CV/Resume uploaded succesfully" });
}
