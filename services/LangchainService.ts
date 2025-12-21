import Groq from "groq-sdk";
import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";


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
                description: z.string(),
                link: z.string()
            })
        ),
        education: z.array(
            z.object({
                degree: z.string(),
                institute: z.string(),
                year: z.string()
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


export const GenerateImprovedCV = async (
    cvJson: any,
    jobDescription: string
) => {
    const CVSchema = z.object({
        name: z.string(),
        links: z.array(z.string()),
        summary: z.string(),
        position: z.string(),
        projects: z.array(
            z.object({
                link: z.string(),
                title: z.string(),
                description: z.string()
            })
        ),
        education: z.array(
            z.object({
                year: z.string(),
                degree: z.string(),
                institute: z.string()
            })
        ),
        experience: z.array(
            z.object({
                title: z.string(),
                company: z.string(),
                description: z.string()
            })
        ),
        tech_stack: z.array(z.string())
    });

    const parser = StructuredOutputParser.fromZodSchema(CVSchema);

    const llm = new ChatGroq({
        apiKey: process.env.GROQ_API_KEY!,
        model: "meta-llama/llama-4-maverick-17b-128e-instruct",
        temperature: 0.4
    });

    const response = await llm.invoke([
        new SystemMessage(`
                You are an ATS resume optimizer.

                STRICT RULES:
                - Do NOT change CV structure
                - Do NOT add/remove fields
                - Keep name, links, education unchanged
                - Improve wording ONLY using job description
                - Optimize for ATS keywords
                - Return ONLY valid JSON

        ${parser.getFormatInstructions()}
    `),
        new HumanMessage(`
                JOB DESCRIPTION:
                ${jobDescription}

                CURRENT CV JSON:
                ${JSON.stringify(cvJson, null, 2)}
                    `)
    ]);

    return parser.parse(response.content as string);
};
