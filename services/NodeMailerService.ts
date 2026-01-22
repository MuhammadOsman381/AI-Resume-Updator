import nodemailer from "nodemailer";

export async function sendEmail(to: string, subject: string, body: string, pdfBuffer: Buffer, name: string, userEmail: string) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: true,
        auth: {
            user: userEmail,
            pass: process.env.SMTP_PASS,
        },
    });

    await transporter.sendMail({
        from: `"${name}"`,
        to,
        subject,
        html: body,
        attachments: [
            {
                filename: `${name.replace(" ", "_")}-CV.pdf`,
                content: pdfBuffer,
            },
        ],
    });
}
