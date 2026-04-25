"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import NavBar from "@/components/NavBar";
import { Loader2, FileText, Search, Sparkles, ArrowLeft } from "lucide-react";

interface JobDescriptionStepProps {
    selectionType: "ats" | "improve" | "";
    text: string;
    setText: (text: string) => void;
    loader: boolean;
    handleFinalSubmit: () => void;
    setStep: (step: number) => void;
}

export function JobDescriptionStep({
    selectionType,
    text,
    setText,
    loader,
    handleFinalSubmit,
    setStep,
}: JobDescriptionStepProps) {
    const isAts = selectionType === "ats";
    const config = {
        icon: isAts
            ? <Search className="w-5 h-5" />
            : <Sparkles className="w-5 h-5" />,
        iconBg: isAts ? "from-blue-500 to-cyan-500" : "from-violet-500 to-purple-600",
        title: isAts ? "Check ATS Score" : "Generate ATS Friendly CV",
        subtitle: isAts
            ? "Paste the job description to analyze your resume fit"
            : "Paste the job description to generate a tailored resume",
        btnText: isAts ? "Calculate ATS Score" : "Improve My CV",
        loadingText: isAts ? "Calculating Score…" : "Improving CV…",
    };

    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <NavBar loginPage={false} showSideBarTrigger={false} />

            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-2xl space-y-6">
                    {/* Header */}
                    <div className="flex items-start gap-4">
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${config.iconBg} flex items-center justify-center text-white flex-shrink-0 shadow-md`}>
                            {config.icon}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">{config.title}</h1>
                            <p className="text-muted-foreground text-sm mt-0.5">{config.subtitle}</p>
                        </div>
                    </div>

                    {/* Text area card */}
                    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                Job Description
                            </label>
                            <span className="text-xs text-muted-foreground">{wordCount} words</span>
                        </div>

                        <Textarea
                            placeholder="Paste the full job description here. The more details you provide, the better the analysis will be…"
                            rows={12}
                            className="resize-none bg-background/60 border-border/60 focus:border-primary/50 focus:ring-primary/20 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 transition-all"
                            onChange={(e) => setText(e.target.value)}
                            value={text}
                        />

                        {/* Minimum word hint */}
                        {wordCount > 0 && wordCount < 30 && (
                            <p className="text-xs text-amber-500 dark:text-amber-400">
                                💡 Tip: Add more details for a more accurate analysis (aim for 50+ words).
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleFinalSubmit}
                            disabled={loader || !text.trim()}
                            className={`flex-1 h-12 rounded-xl font-semibold bg-gradient-to-r ${config.iconBg} text-white border-0 hover:opacity-90 transition-all duration-200 hover:shadow-lg active:scale-[0.98] disabled:opacity-50`}
                        >
                            {loader ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {config.loadingText}
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    {config.icon}
                                    {config.btnText}
                                </span>
                            )}
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => {
                                if (selectionType === "improve") setStep(2);
                                else setStep(5);
                            }}
                            className="h-12 px-5 rounded-xl border-border/60 text-foreground hover:bg-muted/60 transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
