"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, Loader2, Copy, Download, Sparkles, Building2, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import NavBar from "@/components/NavBar";

interface CoverLetterStepProps {
    handleGenerate: (jobTitle: string, companyName: string, jobDescription: string) => Promise<void>;
    coverLetter: string;
    loading: boolean;
    setStep: (step: number) => void;
    downloadPDF: () => void;
}

export function CoverLetterStep({ handleGenerate, coverLetter, loading, setStep, downloadPDF }: CoverLetterStepProps) {
    const { toast } = useToast();
    const [jobTitle, setJobTitle] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [jobDescription, setJobDescription] = useState("");

    const onCopy = () => {
        navigator.clipboard.writeText(coverLetter);
        toast({
            title: "Copied!",
            description: "Cover letter copied to clipboard.",
        });
    };

    const inputCls = "rounded-xl border-border/60 bg-background text-foreground h-10 text-sm focus:border-primary/50 transition-colors";
    const textareaCls = "rounded-xl border-border/60 bg-background text-foreground text-sm resize-none focus:border-primary/50 transition-colors";

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <NavBar loginPage={false} showSideBarTrigger={false} />

            <div className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Cover Letter Generator</h1>
                        <p className="text-muted-foreground mt-1 text-sm">Fill in the details to create a perfectly tailored cover letter.</p>
                    </div>
                    <Button variant="ghost" onClick={() => setStep(5)} className="self-start md:self-auto rounded-xl">
                        ← Back to Tools
                    </Button>
                </div>

                <div className="grid md:grid-cols-5 gap-8">
                    {/* Form Side */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-5">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                        <Briefcase className="w-3.5 h-3.5" /> Job Title
                                    </Label>
                                    <Input
                                        placeholder="e.g. Senior Software Engineer"
                                        value={jobTitle}
                                        onChange={(e) => setJobTitle(e.target.value)}
                                        className={inputCls}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                        <Building2 className="w-3.5 h-3.5" /> Company Name
                                    </Label>
                                    <Input
                                        placeholder="e.g. Google"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className={inputCls}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                        <FileText className="w-3.5 h-3.5" /> Job Description
                                    </Label>
                                    <Textarea
                                        placeholder="Paste the job description here..."
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        rows={10}
                                        className={textareaCls}
                                    />
                                </div>
                            </div>

                            <Button
                                className="w-full h-11 rounded-xl gradient-primary text-white font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                                onClick={() => handleGenerate(jobTitle, companyName, jobDescription)}
                                disabled={loading || !jobTitle || !companyName || !jobDescription}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" /> Generate Cover Letter
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Output Side */}
                    <div className="md:col-span-3 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-500" /> Result
                            </h3>
                            {coverLetter && (
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={onCopy} className="rounded-lg h-8 px-3 gap-1.5 text-xs">
                                        <Copy className="w-3.5 h-3.5" /> Copy
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={downloadPDF} className="rounded-lg h-8 px-3 gap-1.5 text-xs border-amber-500/30 text-amber-600 hover:bg-amber-500/5">
                                        <Download className="w-3.5 h-3.5" /> PDF
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl border border-border/60 bg-card min-h-[500px] shadow-sm overflow-hidden flex flex-col">
                            {coverLetter ? (
                                <div className="flex-1 p-8 text-sm leading-relaxed text-foreground/90 font-mono whitespace-pre-wrap overflow-auto">
                                    {coverLetter}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-4">
                                    <div className="w-16 h-16 rounded-2xl bg-muted fill-muted flex items-center justify-center text-muted-foreground">
                                        <FileText className="w-8 h-8 opacity-20" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground/50">No Cover Letter Generated Yet</p>
                                        <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">Fill in the job details on the left and click generate.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
