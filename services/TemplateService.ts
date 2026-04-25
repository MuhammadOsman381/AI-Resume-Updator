import { db } from "@/db";
import { templates } from "@/db/schema";
import { eq } from "drizzle-orm";
import ejs from "ejs";
import path from "path";

export async function renderTemplate(templateId: string, data: any) {
    let html = "";

    // Check if dynamic template from DB
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(templateId);
    if (isUUID) {
        const dbTemplate = await db
            .select()
            .from(templates)
            .where(eq(templates.id, templateId))
            .limit(1);

        if (dbTemplate.length) {
            html = ejs.render(dbTemplate[0].ejs, data);
        }
    }

    // Fallback to static templates
    if (!html) {
        const templatePath = path.join(
            process.cwd(),
            "templates",
            "cv",
            `${templateId}.ejs`
        );
        html = await ejs.renderFile(templatePath, data);
    }

    return html;
}
