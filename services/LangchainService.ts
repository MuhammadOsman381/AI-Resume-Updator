import Groq from "groq-sdk";
import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const ParseCV = async (text: string) => {
    const schema = z.object({
        name: z.string(),
        position: z.string(),
        links: z.array(z.string()),
        summary: z.string(),
        tech_stack: z.array(z.string()),
        projects: z.array(
            z.object({
                title: z.string(),
                description: z.string()
            })
        ),
        education: z.array(
            z.object({
                degree: z.string(),
                institute: z.string(),
                year: z.string().optional()
            })
        ),
        experience: z.array(
            z.object({
                title: z.string(),
                company: z.string().optional(),
                description: z.string()
            })
        )
    });
    const parser = StructuredOutputParser.fromZodSchema(schema);
    const instructions = parser.getFormatInstructions();
    const res = await client.chat.completions.create({
        model: "meta-llama/llama-4-maverick-17b-128e-instruct",
        temperature: 0,
        messages: [
            { role: "system", content: "Extract CV information and return JSON." },
            { role: "user", content: `${instructions}\n\nExtract from:\n${text}` }
        ]
    });

    return parser.parse(res.choices[0].message.content || "");
};
