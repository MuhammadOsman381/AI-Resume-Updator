import Groq from "groq-sdk";
import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";
import sanitizeHtml from "sanitize-html";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY! });

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
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        temperature: 0,
        messages: [
            {
                role: "system", content: `Extract CV information and return JSON.
                IMPORTANT: Make project descriptions detailed. Include responsibilities, technologies, results, and impact where possible.
                ` },
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
        name: z.string().optional(),
        links: z.array(z.string()).optional(),
        summary: z.string().optional(),
        position: z.string().optional(),
        projects: z.array(
            z.object({
                link: z.string().optional(),
                title: z.string().optional(),
                description: z.string().optional()
            })
        ).optional(),
        education: z.array(
            z.object({
                year: z.string().optional(),
                degree: z.string().optional(),
                institute: z.string().optional()
            })
        ).optional(),
        experience: z.array(
            z.object({
                title: z.string().optional(),
                company: z.string().optional(),
                description: z.string().optional()
            })
        ).optional(),
        tech_stack: z.array(z.string()).optional()
    });

    const parser = StructuredOutputParser.fromZodSchema(CVSchema);

    const llm = new ChatGroq({
        apiKey: process.env.GROQ_API_KEY!,
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        temperature: 0.4
    });

    const response = await llm.invoke([
        new SystemMessage(`
                You are an ATS resume optimizer.

                STRICT RULES:
                - Do NOT change Resume structure
                - Do NOT add/remove fields
                - Keep name, links, education unchanged
                - Improve or add wording ONLY using job description
                - Optimize for ATS keywords
                - Expand project descriptions with detailed responsibilities, technologies, outcomes, and impact
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

export const GenerateProfessionalEmail = async (
    jobTitle: string,
    jobDescription: string,
    applicantName?: string,
    improvedCVJSON?: any
) => {

    const client = new Groq({ apiKey: process.env.GROQ_API_KEY! });

    // Define the expected JSON schema
    const EmailSchema = z.object({
        subject: z.string(),
        body: z.string(),
    });
    const parser = StructuredOutputParser.fromZodSchema(EmailSchema);

    const llm = new ChatGroq({
        apiKey: process.env.GROQ_API_KEY!,
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        temperature: 0.5,
    });

    // Safely serialize the CV
    const safeCV = JSON.parse(JSON.stringify(improvedCVJSON || {}));

    const systemMessage = new SystemMessage(`
        You are an AI professional email writer.

        STRICT RULES:
        - Generate a professional email for applying to a job.
        - Use the job title and job description to highlight relevant skills and experience.
        - ONLY mention skills, projects, tech stack, or experience that are present in the applicant's CV.
        - Do NOT invent skills or experiences not in the CV.
        - Personalize the email greeting if applicant name is provided.
        - Include a sentence like: "I have attached my CV, please review it."
        - Keep it polite, concise, and persuasive.
        - Format the email body in proper HTML with paragraphs, spacing, and bullet points if needed.
        - Return ONLY valid JSON in the following format:
${parser.getFormatInstructions()}
  `);

    const humanMessage = new HumanMessage(`
JOB TITLE:
${jobTitle}

JOB DESCRIPTION:
${jobDescription}

APPLICANT NAME:
${applicantName || "Not Provided"}

APPLICANT CV:
${JSON.stringify(safeCV, null, 2)}
  `);

    let parsed;
    try {
        const response = await llm.invoke([systemMessage, humanMessage]);
        parsed = await parser.parse(response.content as string);
    } catch (err) {
        console.error("Error parsing LLM output:", err);
        throw new Error("Failed to generate professional email from AI");
    }

    const safeBody = sanitizeHtml(parsed.body, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["p", "br", "ul", "li", "div"]),
        allowedAttributes: false,

    });

    const htmlBody = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
        ${safeBody}
      </body>
    </html>
  `;

    return {
        subject: parsed.subject,
        body: htmlBody,
    };
};

export const CheckATSScore = async (cvJson: any, jobDescription: string) => {
    const scoreSchema = z.object({
        score: z.number().min(0).max(100),
        feedback: z.string(),
        missingKeywords: z.array(z.string()),
        strengths: z.array(z.string()),
        weaknesses: z.array(z.string()),
    });

    const parser = StructuredOutputParser.fromZodSchema(scoreSchema);
    const instructions = parser.getFormatInstructions();

    const res = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0,
        messages: [
            {
                role: "system",
                content: `You are a specialized ATS (Applicant Tracking System) algorithm expert. 
                Your task is to analyze a CV against a Job Description with UNCOMPROMISING RIGOR.

                STRICT SCORING CRITERIA:
                1. Keyword Match (30 pts): Do they have the exact tech tools and skills?
                2. Experience Depth (40 pts): Is the level of responsibility and industry context a direct match?
                3. Quantifiable Impact (20 pts): Are there numbers, metrics, or clear business outcomes? Penalize generic descriptions.
                4. Structure & Clarity (10 pts): Is the information easily extractable and logically organized?

                FEEDBACK RULES (Required for the 'feedback' field):
                - Be blunt and objective. Avoid generic praise.
                - Directly state if the candidate is a viable match for this specific role.
                - Explicitly identify the single most critical gap (missing tech, seniority level, or domain experience).
                - Give one actionable strategic tip to improve the CV's relevance to this JD.

                SCORING TIERS:
                - 85-100: Industry Top 1%. Perfect alignment.
                - 70-84: Solid Candidate. Minor gaps in non-critical areas.
                - 50-69: Potential Match. Significant training or key technical gaps.
                - 0-49: Non-Match. Do not recommend.

                Be BRUTALLY HONEST. If the candidate is missing a core tech requirement (e.g., job requires Kubernetes and it's not in the CV), the score should not exceed 65.

                ${instructions}
                `
            },
            {
                role: "user",
                content: `JOB DESCRIPTION:
${jobDescription}

CV JSON:
${JSON.stringify(cvJson, null, 2)}`
            }
        ]
    });

    let content = res.choices[0].message.content || "";
    // Clean up markdown backticks if present
    content = content.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();

    try {
        const parsed = JSON.parse(content);
        return scoreSchema.parse(parsed); // Validate with zod
    } catch (e) {
        return parser.parse(content);
    }
};

export const GenerateCoverLetter = async (
    cvJson: any,
    jobTitle: string,
    companyName: string,
    jobDescription: string
) => {
    const CoverLetterSchema = z.object({
        coverLetter: z.string(),
    });
    const parser = StructuredOutputParser.fromZodSchema(CoverLetterSchema);

    const llm = new ChatGroq({
        apiKey: process.env.GROQ_API_KEY!,
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        temperature: 0.6,
    });

    const systemMessage = new SystemMessage(`
        You are an AI cover letter writer.

        STRICT RULES:
        - Generate a compelling and professional cover letter for a job application.
        - Use the job title, company name, and job description to tailor the letter.
        - Highlight relevant skills, projects, tech stack, or experience from the applicant's CV.
        - Do NOT invent skills or experiences not in the CV.
        - Maintain a professional and persuasive tone.
        - Format the cover letter with proper business letter formatting (though exclude addresses if not known).
        - Return ONLY valid JSON in the following format:
        ${parser.getFormatInstructions()}
    `);

    const humanMessage = new HumanMessage(`
        JOB TITLE: ${jobTitle}
        COMPANY NAME: ${companyName}
        JOB DESCRIPTION: ${jobDescription}
        APPLICANT CV: ${JSON.stringify(cvJson, null, 2)}
    `);

    const response = await llm.invoke([systemMessage, humanMessage]);
    return parser.parse(response.content as string);
};

