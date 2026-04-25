"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import NavBar from "@/components/NavBar";

interface SelectionStepProps {
    setSelectionType: (type: "ats" | "improve" | "") => void;
    setStep: (step: number) => void;
}

export function SelectionStep({ setSelectionType, setStep }: SelectionStepProps) {
    const options = [
        {
            type: "ats" as const,
            nextStep: 3,
            icon: <Search className="w-6 h-6" />,
            iconBg: "from-blue-500 to-cyan-500",
            title: "Check ATS Score",
            description: "See how well your resume matches the job description and get a detailed keyword gap analysis.",
            benefits: ["ATS compatibility score", "Missing keyword report", "Strength & weakness analysis"],
            accentClass: "hover:border-blue-500/50 hover:shadow-blue-500/10",
            btnClass: "bg-blue-600 hover:bg-blue-700",
        },
        {
            type: "improve" as const,
            nextStep: 2,
            icon: <Sparkles className="w-6 h-6" />,
            iconBg: "from-violet-500 to-purple-600",
            title: "Generate ATS Friendly CV",
            description: "Let AI rewrite and optimize your resume content specifically tailored to this job description.",
            benefits: ["AI-optimized content", "Keyword integration", "Downloadable PDF"],
            accentClass: "hover:border-violet-500/50 hover:shadow-violet-500/10",
            btnClass: "bg-violet-600 hover:bg-violet-700",
        },
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <NavBar loginPage={false} showSideBarTrigger={false} />

            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-4xl space-y-10">
                    {/* Header */}
                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium border border-primary/20">
                            <Sparkles className="w-3.5 h-3.5" />
                            CV Analysis Tools
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                            What would you like to do?
                        </h1>
                        <p className="text-muted-foreground text-base max-w-md mx-auto">
                            Choose how you'd like to use AI to improve your job application success rate.
                        </p>
                    </div>

                    {/* Option Cards */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {options.map((opt) => (
                            <div
                                key={opt.type}
                                onClick={() => { setSelectionType(opt.type); setStep(opt.nextStep); }}
                                className={`group relative rounded-2xl border border-border/60 bg-card p-6 cursor-pointer transition-all duration-300 hover:shadow-xl ${opt.accentClass} hover:-translate-y-0.5`}
                            >
                                {/* Icon */}
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${opt.iconBg} flex items-center justify-center text-white mb-5 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                    {opt.icon}
                                </div>

                                <h2 className="text-xl font-bold text-foreground mb-2">{opt.title}</h2>
                                <p className="text-muted-foreground text-sm leading-relaxed mb-5">{opt.description}</p>

                                {/* Benefits */}
                                <ul className="space-y-1.5 mb-6">
                                    {opt.benefits.map((b, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-foreground/80">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                            {b}
                                        </li>
                                    ))}
                                </ul>

                                <Button className={`w-full ${opt.btnClass} text-white rounded-xl h-11 font-semibold transition-all duration-200`}>
                                    Get Started <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>

                                {/* Decorative corner glow */}
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${opt.iconBg} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300 pointer-events-none`} />
                            </div>
                        ))}
                    </div>

                    {/* Back button */}
                    <div className="text-center">
                        <Button
                            variant="ghost"
                            className="text-muted-foreground hover:text-foreground rounded-xl"
                            onClick={() => setStep(1)}
                        >
                            ← Back to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

