"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import { Loader2, Download, ArrowLeft, LayoutTemplate, ArrowRight } from "lucide-react";

interface TemplateStepProps {
    template: string;
    setTemplate: (temp: string) => void;
    setStep: (step: number) => void;
    hoveredTemplate: string | null;
    setHoveredTemplate: (temp: string | null) => void;
    downloadCV: () => void;
    loader: boolean;
}

const TEMPLATES = [
    { value: "temp1", label: "Template 1" },
    { value: "temp2", label: "Template 2" },
];

export function TemplateStep({
    template,
    setTemplate,
    setStep,
    hoveredTemplate,
    setHoveredTemplate,
    downloadCV,
    loader,
}: TemplateStepProps) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <NavBar loginPage={false} showSideBarTrigger={false} />

            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-2xl space-y-6">
                    {/* Header */}
                    <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                            <LayoutTemplate className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Choose a Template</h1>
                            <p className="text-muted-foreground text-sm mt-0.5">
                                Pick a design for your CV. Hover over a template to preview it.
                            </p>
                        </div>
                    </div>

                    {/* Template picker card */}
                    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-5">
                        <div>
                            <Label className="text-sm font-semibold text-foreground mb-2 block">Select Template</Label>
                            <div className="relative flex items-start gap-4">
                                <Select
                                    onValueChange={(value) => {
                                        setTemplate(value);
                                        setHoveredTemplate(null);
                                    }}
                                >
                                    <SelectTrigger className="w-52 rounded-xl border-border/60 bg-background text-foreground h-11">
                                        <SelectValue placeholder="Choose template…" />
                                    </SelectTrigger>

                                    <SelectContent className="rounded-xl border-border/60 bg-card">
                                        {TEMPLATES.map((t) => (
                                            <SelectItem
                                                key={t.value}
                                                value={t.value}
                                                onMouseEnter={() => setHoveredTemplate(t.value)}
                                                onMouseLeave={() => setHoveredTemplate(null)}
                                                className="rounded-lg cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3 py-1">
                                                    <Image
                                                        src={`/templates/${t.value}.png`}
                                                        alt={t.label}
                                                        width={36}
                                                        height={50}
                                                        className="rounded-md border border-border/40 object-cover"
                                                    />
                                                    <span className="font-medium text-sm">{t.label}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Hover preview */}
                                {hoveredTemplate && (
                                    <div className="absolute left-56 top-0 w-72 rounded-2xl border border-border/60 bg-card shadow-2xl p-3 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                                        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Preview</p>
                                        <Image
                                            src={`/templates/${hoveredTemplate}.png`}
                                            alt="Template Preview"
                                            width={270}
                                            height={380}
                                            className="rounded-xl border border-border/30 w-full"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Selected template preview */}
                        {template && !hoveredTemplate && (
                            <div className="rounded-xl overflow-hidden border border-border/40 bg-muted/30">
                                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b border-border/30 uppercase tracking-wide">
                                    Selected: {TEMPLATES.find(t => t.value === template)?.label}
                                </div>
                                <div className="p-3 flex justify-center">
                                    <Image
                                        src={`/templates/${template}.png`}
                                        alt="Selected Template"
                                        width={200}
                                        height={280}
                                        className="rounded-lg border border-border/30 shadow-sm"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => setStep(3)}
                            disabled={!template}
                            className="flex-1 h-12 rounded-xl gradient-primary text-white border-0 font-semibold hover:opacity-90 transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-40"
                        >
                            Continue <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>

                        <Button
                            onClick={downloadCV}
                            disabled={loader || !template}
                            variant="outline"
                            className="h-12 px-5 rounded-xl border-border/60 text-foreground hover:bg-muted/60 disabled:opacity-40"
                        >
                            {loader ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={() => setStep(5)}
                            className="h-12 px-5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
