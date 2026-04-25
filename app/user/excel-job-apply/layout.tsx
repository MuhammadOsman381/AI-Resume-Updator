import type { Metadata } from "next";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
    title: "Apply Jobs — ResumeAI",
    description: "Save job listings and send tailored AI-generated cover letter emails to recruiters.",
};

export default function JobApplyLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <NavBar loginPage={false} showSideBarTrigger={false} />
            <main className="flex-1">{children}</main>
        </div>
    );
}
