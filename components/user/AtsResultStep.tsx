"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertTriangle, Sparkles, Target, RotateCcw } from "lucide-react";
import NavBar from "@/components/NavBar";

interface AtsResultStepProps {
    atsResult: any;
    setSelectionType: (type: "ats" | "improve" | "") => void;
    setStep: (step: number) => void;
}

export function AtsResultStep({ atsResult, setSelectionType, setStep }: AtsResultStepProps) {
    if (!atsResult) return null;

    const score = atsResult.score as number;
    const scoreColor =
        score >= 80 ? "text-emerald-500" :
        score >= 60 ? "text-amber-500" : "text-red-500";
    const scoreBg =
        score >= 80 ? "from-emerald-500 to-teal-500" :
        score >= 60 ? "from-amber-500 to-orange-500" : "from-red-500 to-rose-500";
    const scoreLabel =
        score >= 80 ? "Excellent Match" :
        score >= 60 ? "Good Match" : "Needs Work";

    // SVG circle progress
    const radius = 58;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (circumference * score) / 100;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <NavBar loginPage={false} showSideBarTrigger={false} />

            <div className="flex-1 px-4 py-8 md:py-12">
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Page title */}
                    <div className="text-center space-y-1">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">ATS Analysis Results</h1>
                        <p className="text-muted-foreground text-sm">Here's how your resume stacks up against the job description</p>
                    </div>

                    {/* Score hero card */}
                    <div className="rounded-2xl border border-border/60 bg-card p-6 md:p-8 shadow-sm">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            {/* SVG gauge */}
                            <div className="relative flex-shrink-0">
                                <svg className="w-36 h-36 -rotate-90">
                                    <circle
                                        cx="72" cy="72" r={radius}
                                        stroke="currentColor" strokeWidth="10" fill="transparent"
                                        className="text-muted/50"
                                    />
                                    <circle
                                        cx="72" cy="72" r={radius}
                                        stroke="url(#scoreGrad)" strokeWidth="10" fill="transparent"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={offset}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out"
                                    />
                                    <defs>
                                        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" className={`${scoreBg.split(" ")[0].replace("from-", "stop-color-")}`} stopColor={score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444"} />
                                            <stop offset="100%" stopColor={score >= 80 ? "#14b8a6" : score >= 60 ? "#f97316" : "#f43f5e"} />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className={`text-4xl font-black ${scoreColor}`}>{score}</span>
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">/ 100</span>
                                </div>
                            </div>

                            <div className="text-center md:text-left space-y-3">
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${scoreBg} text-white`}>
                                    <Target className="w-3.5 h-3.5" />
                                    {scoreLabel}
                                </div>
                                <h2 className="text-xl font-bold text-foreground">Overall Assessment</h2>
                                <p className="text-muted-foreground leading-relaxed max-w-md italic">
                                    "{atsResult.feedback}"
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="grid md:grid-cols-2 gap-5">
                        {/* Strengths */}
                        <div className="rounded-2xl border border-emerald-200/60 dark:border-emerald-800/30 bg-card p-5 shadow-sm">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h3 className="font-bold text-foreground">Strengths</h3>
                            </div>
                            <ul className="space-y-2.5">
                                {atsResult.strengths?.map((item: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                                        <span className="text-foreground/80 leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Weaknesses */}
                        <div className="rounded-2xl border border-red-200/60 dark:border-red-800/30 bg-card p-5 shadow-sm">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                                    <XCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
                                </div>
                                <h3 className="font-bold text-foreground">Areas to Improve</h3>
                            </div>
                            <ul className="space-y-2.5">
                                {atsResult.weaknesses?.map((item: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                                        <span className="text-foreground/80 leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Missing Keywords */}
                    <div className="rounded-2xl border border-amber-200/60 dark:border-amber-800/30 bg-card p-5 shadow-sm">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground">Missing Keywords</h3>
                                <p className="text-xs text-muted-foreground">Add these to your resume to boost your match score</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {atsResult.missingKeywords?.length > 0
                                ? atsResult.missingKeywords.map((kw: string, i: number) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1.5 rounded-full border border-amber-300/60 dark:border-amber-700/40 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors cursor-default"
                                    >
                                        {kw}
                                    </span>
                                ))
                                : <span className="text-sm text-muted-foreground italic">🎉 No critical keywords missing!</span>
                            }
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                            onClick={() => { setSelectionType("improve"); setStep(2); }}
                            className="flex-1 h-12 rounded-xl gradient-primary text-white border-0 font-semibold hover:opacity-90 transition-all hover:shadow-lg active:scale-[0.98]"
                        >
                            <Sparkles className="mr-2 w-4 h-4" />
                            Improve This Resume
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setStep(1)}
                            className="h-12 px-6 rounded-xl border-border/60 text-foreground hover:bg-muted/60"
                        >
                            <RotateCcw className="mr-2 w-4 h-4" />
                            Try Another Resume
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
