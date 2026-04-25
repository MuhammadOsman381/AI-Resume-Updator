import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "CV Builder — ResumeAI",
    description: "Build, upload, and manage your AI-powered resumes.",
};

export default function UserLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return <>{children}</>;
}
