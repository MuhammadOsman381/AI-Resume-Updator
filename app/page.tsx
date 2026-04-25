"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon, Zap, FileText, Brain, Target } from "lucide-react";

export default function Login() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        if (session) {
            if (session.jwt) {
                localStorage.setItem("authorization", session.jwt);
            }
            router.push("/user");
        }
    }, [session, router]);

    if (status === "loading") {
        return (
            <div className="flex justify-center items-center h-screen bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg animate-pulse">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-muted-foreground text-sm animate-pulse">Loading…</p>
                </div>
            </div>
        );
    }

    const features = [
        {
            icon: <FileText className="w-5 h-5" />,
            title: "AI CV Builder",
            desc: "Parse, build, or upload your resume in seconds",
        },
        {
            icon: <Target className="w-5 h-5" />,
            title: "ATS Score",
            desc: "See exactly how well you match a job description",
        },
        {
            icon: <Brain className="w-5 h-5" />,
            title: "Smart Optimization",
            desc: "AI rewrites your CV tailored to every application",
        },
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Navbar */}
            <header className="flex items-center justify-between px-6 h-16 border-b border-border/40 bg-card/60 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
                        <Zap className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[16px] font-bold tracking-tight">
                        Resume<span className="text-gradient">AI</span>
                    </span>
                </div>
                <button
                    onClick={toggleTheme}
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-border/60 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
                >
                    {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
            </header>

            {/* Hero */}
            <main className="flex-1 flex items-center justify-center px-6 py-16">
                <div className="w-full max-w-5xl grid md:grid-cols-2 gap-16 items-center">

                    {/* LEFT: Headline */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium border border-primary/20">
                                <Zap className="w-3.5 h-3.5" />
                                Powered by Groq & Llama 3
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">
                                Your AI-powered<br />
                                <span className="text-gradient">Career Co-pilot</span>
                            </h1>
                            <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                                Build beautiful, ATS-optimized resumes and instantly see how well you match any job — all in one place.
                            </p>
                        </div>

                        {/* Feature list */}
                        <div className="space-y-3">
                            {features.map((f, i) => (
                                <div
                                    key={i}
                                    className="flex items-start gap-3.5 p-3.5 rounded-xl bg-muted/40 border border-border/40 hover:bg-muted/60 transition-colors duration-200"
                                >
                                    <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                                        {f.icon}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-foreground">{f.title}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Login card */}
                    <div className="flex justify-center">
                        <div className="w-full max-w-sm glass rounded-3xl p-8 shadow-2xl shadow-primary/5 space-y-6">
                            <div className="text-center space-y-2">
                                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto shadow-lg">
                                    <Zap className="w-7 h-7 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground">Get Started</h2>
                                <p className="text-sm text-muted-foreground">
                                    Sign in to build your perfect resume
                                </p>
                            </div>

                            <button
                                onClick={() => signIn("google")}
                                className="w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-card hover:bg-muted border border-border/60 hover:border-border text-foreground font-medium text-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]"
                            >
                                <img
                                    src="https://www.google.com/favicon.ico"
                                    alt="Google"
                                    className="w-5 h-5"
                                />
                                Continue with Google
                            </button>

                            <p className="text-center text-xs text-muted-foreground">
                                By signing in, you agree to our{" "}
                                <span className="text-primary hover:underline cursor-pointer">Terms</span> &{" "}
                                <span className="text-primary hover:underline cursor-pointer">Privacy</span>
                            </p>
                        </div>
                    </div>

                </div>
            </main>

            {/* Footer */}
            <footer className="text-center py-6 text-xs text-muted-foreground border-t border-border/30">
                © {new Date().getFullYear()} ResumeAI. All rights reserved.
            </footer>
        </div>
    );
}
