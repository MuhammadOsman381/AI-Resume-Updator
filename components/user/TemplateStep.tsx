import { useEffect, useState } from "react";
import axios from "axios";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import { Loader2, Download, ArrowLeft, LayoutTemplate, ArrowRight } from "lucide-react";

interface Template {
    id?: string;
    value: string;
    label: string;
    imageUrl: string;
    ejs?: string;
}

interface TemplateStepProps {
    template: string;
    setTemplate: (temp: string) => void;
    setStep: (step: number) => void;
    hoveredTemplate: string | null;
    setHoveredTemplate: (temp: string | null) => void;
    downloadCV: () => void;
    loader: boolean;
}

const STATIC_TEMPLATES: Template[] = [
    { value: "temp1", label: "Classic Serif", imageUrl: "/templates/temp1.png" },
    { value: "temp2", label: "Modern Clean", imageUrl: "/templates/temp2.png" },
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
    const [allTemplates, setAllTemplates] = useState<Template[]>(STATIC_TEMPLATES);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        const fetchTemplates = async () => {
            setFetching(true);
            try {
                const res = await axios.get("/api/templates");
                if (res.data.status === "ok") {
                    console.log(res.data.templates);
                    const dynamicMapped = res.data.templates.map((t: any) => ({
                        id: t.id,
                        value: t.id, // Use ID as value for dynamic ones
                        label: t.title,
                        imageUrl: t.imageUrl,
                    }));
                    setAllTemplates([...STATIC_TEMPLATES, ...dynamicMapped]);
                }
            } catch (err) {
                console.error("Failed to fetch templates", err);
            } finally {
                setFetching(false);
            }
        };
        fetchTemplates();
    }, []);

    const selectedTemplateObj = allTemplates.find(t => t.value === template);
    const hoveredTemplateObj = allTemplates.find(t => t.value === hoveredTemplate);

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
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold text-foreground block">Select Template</Label>
                            {fetching && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                        </div>
                        <div className="relative flex items-start gap-4">
                            <Select
                                value={template}
                                onValueChange={(value) => {
                                    setTemplate(value);
                                    setHoveredTemplate(null);
                                }}
                            >
                                <SelectTrigger className="w-64 rounded-xl border-border/60 bg-background text-foreground h-11">
                                    <SelectValue placeholder="Choose template…" />
                                </SelectTrigger>

                                <SelectContent className="rounded-xl border-border/60 bg-card max-h-80">
                                    {allTemplates.map((t) => (
                                        <SelectItem
                                            key={t.value}
                                            value={t.value}
                                            onMouseEnter={() => setHoveredTemplate(t.value)}
                                            onMouseLeave={() => setHoveredTemplate(null)}
                                            className="rounded-lg cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3 py-1">
                                                <div className="w-9 h-12 relative flex-shrink-0">
                                                    <img
                                                        src={t.imageUrl}
                                                        alt={t.label}
                                                        className="rounded-md border border-border/40 object-cover"
                                                    />
                                                </div>
                                                <span className="font-medium text-sm">{t.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Hover preview */}
                            {hoveredTemplate && hoveredTemplateObj && (
                                <div className="absolute left-72 top-0 w-72 rounded-2xl border border-border/60 bg-card shadow-2xl p-3 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Preview: {hoveredTemplateObj.label}</p>
                                    <div className="relative aspect-[1/1.4] w-full">
                                        <img
                                            src={hoveredTemplateObj.imageUrl}
                                            alt="Template Preview"
                                            className="rounded-xl border border-border/30 object-cover"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Selected template preview */}
                        {template && !hoveredTemplate && selectedTemplateObj && (
                            <div className="rounded-xl overflow-hidden border border-border/40 bg-muted/30">
                                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b border-border/30 uppercase tracking-wide">
                                    Selected: {selectedTemplateObj.label}
                                </div>
                                <div className="p-4 flex justify-center">
                                    <div className="relative w-48 aspect-[1/1.4]">
                                        <img
                                            src={selectedTemplateObj.imageUrl}
                                            alt="Selected Template"
                                            className="rounded-lg border border-border/30 shadow-sm object-cover"
                                        />
                                    </div>
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
