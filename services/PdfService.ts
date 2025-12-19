import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import fs from "fs";
import path from "path";

export const GetText = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const tmpPath = path.join("/tmp", "uploaded.pdf");
  fs.writeFileSync(tmpPath, buffer);
  const loader = new PDFLoader(tmpPath, { splitPages: false });
  const docs = await loader.load();
  fs.unlinkSync(tmpPath)
  return docs.map(doc => doc.pageContent).join("\n\n");
};
