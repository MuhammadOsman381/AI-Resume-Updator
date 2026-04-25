"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Download, Loader2, ArrowLeft } from "lucide-react";
import NavBar from "@/components/NavBar";
import { CVFormData } from "@/types/cv";

interface ImproveStepProps {
    improvedCV: CVFormData;
    setImprovedCV: React.Dispatch<React.SetStateAction<CVFormData>>;
    setStep: (step: number) => void;
    loader: boolean;
    improvedCVLoader: boolean;
    downloadCV: () => void;
    downloadImprovedCV: () => void;
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border/40 bg-muted/30">
                <h3 className="font-semibold text-sm text-foreground">{title}</h3>
            </div>
            <div className="p-5 space-y-4">{children}</div>
        </div>
    );
}

function FieldInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</Label>
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="rounded-xl border-border/60 bg-background text-foreground h-10 text-sm focus:border-primary/50"
            />
        </div>
    );
}

export function ImproveStep({
    improvedCV,
    setImprovedCV,
    setStep,
    loader,
    improvedCVLoader,
    downloadCV,
    downloadImprovedCV,
}: ImproveStepProps) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <NavBar loginPage={false} showSideBarTrigger={false} />

            <div className="flex-1 px-4 py-8 overflow-auto">
                <div className="max-w-3xl mx-auto space-y-5">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">✨ Your Improved CV</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">Review and edit before downloading</p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={loader}
                                onClick={downloadCV}
                                className="rounded-xl border-border/60 text-foreground hover:bg-muted/60 h-9"
                            >
                                {loader ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                                <span className="ml-1.5 hidden sm:inline text-xs">Original</span>
                            </Button>
                            <Button
                                size="sm"
                                disabled={improvedCVLoader}
                                onClick={downloadImprovedCV}
                                className="rounded-xl gradient-primary text-white border-0 h-9 hover:opacity-90"
                            >
                                {improvedCVLoader ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                                <span className="ml-1.5 text-xs">Download Improved</span>
                            </Button>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <SectionCard title="Basic Information">
                        <FieldInput label="Full Name" value={improvedCV.name} onChange={(v) => setImprovedCV(p => ({ ...p, name: v }))} placeholder="John Doe" />
                        <FieldInput label="Position" value={improvedCV.position} onChange={(v) => setImprovedCV(p => ({ ...p, position: v }))} placeholder="Software Engineer" />
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Summary</Label>
                            <Textarea
                                value={improvedCV.summary}
                                onChange={(e) => setImprovedCV(p => ({ ...p, summary: e.target.value }))}
                                rows={4}
                                placeholder="Professional summary…"
                                className="rounded-xl border-border/60 bg-background text-foreground text-sm resize-none focus:border-primary/50"
                            />
                        </div>
                    </SectionCard>

                    {/* Links */}
                    <SectionCard title="Links">
                        <div className="space-y-2">
                            {improvedCV.links.map((link, i) => (
                                <div key={i} className="flex gap-2">
                                    <Input
                                        placeholder="https://..."
                                        value={link}
                                        onChange={(e) => {
                                            const updated = [...improvedCV.links];
                                            updated[i] = e.target.value;
                                            setImprovedCV(p => ({ ...p, links: updated }));
                                        }}
                                        className="rounded-xl border-border/60 bg-background text-foreground h-10 text-sm"
                                    />
                                    {improvedCV.links.length > 1 && (
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => setImprovedCV(p => ({ ...p, links: p.links.filter((_, idx) => idx !== i) }))}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setImprovedCV(p => ({ ...p, links: [...p.links, ""] }))} className="rounded-xl h-8 border-border/60 text-muted-foreground hover:text-foreground text-xs">
                            <Plus className="w-3.5 h-3.5 mr-1" /> Add Link
                        </Button>
                    </SectionCard>

                    {/* Projects */}
                    <SectionCard title="Projects">
                        <div className="space-y-4">
                            {improvedCV.projects.map((project, i) => (
                                <div key={i} className="p-4 rounded-xl border border-border/40 bg-muted/20 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Project {i + 1}</span>
                                        {improvedCV.projects.length > 1 && (
                                            <button
                                                onClick={() => setImprovedCV(p => ({ ...p, projects: p.projects.filter((_, idx) => idx !== i) }))}
                                                className="text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    <Input placeholder="Project Title" value={project.title} onChange={(e) => { const u = [...improvedCV.projects]; u[i].title = e.target.value; setImprovedCV(p => ({ ...p, projects: u })); }} className="rounded-xl border-border/60 bg-background h-10 text-sm" />
                                    <Textarea placeholder="Description" value={project.description} onChange={(e) => { const u = [...improvedCV.projects]; u[i].description = e.target.value; setImprovedCV(p => ({ ...p, projects: u })); }} rows={3} className="rounded-xl border-border/60 bg-background text-sm resize-none" />
                                    <Input placeholder="Project Link" value={project.link} onChange={(e) => { const u = [...improvedCV.projects]; u[i].link = e.target.value; setImprovedCV(p => ({ ...p, projects: u })); }} className="rounded-xl border-border/60 bg-background h-10 text-sm" />
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setImprovedCV(p => ({ ...p, projects: [...p.projects, { title: "", description: "", link: "" }] }))} className="rounded-xl h-8 border-border/60 text-muted-foreground text-xs">
                            <Plus className="w-3.5 h-3.5 mr-1" /> Add Project
                        </Button>
                    </SectionCard>

                    {/* Education */}
                    <SectionCard title="Education">
                        <div className="space-y-4">
                            {improvedCV.education.map((edu, i) => (
                                <div key={i} className="p-4 rounded-xl border border-border/40 bg-muted/20 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Education {i + 1}</span>
                                        {improvedCV.education.length > 1 && (
                                            <button onClick={() => setImprovedCV(p => ({ ...p, education: p.education.filter((_, idx) => idx !== i) }))} className="text-muted-foreground hover:text-destructive transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    <Input placeholder="Degree" value={edu.degree} onChange={(e) => { const u = [...improvedCV.education]; u[i].degree = e.target.value; setImprovedCV(p => ({ ...p, education: u })); }} className="rounded-xl border-border/60 bg-background h-10 text-sm" />
                                    <Input placeholder="Institute" value={edu.institute} onChange={(e) => { const u = [...improvedCV.education]; u[i].institute = e.target.value; setImprovedCV(p => ({ ...p, education: u })); }} className="rounded-xl border-border/60 bg-background h-10 text-sm" />
                                    <Input placeholder="Year" value={edu.year} onChange={(e) => { const u = [...improvedCV.education]; u[i].year = e.target.value; setImprovedCV(p => ({ ...p, education: u })); }} className="rounded-xl border-border/60 bg-background h-10 text-sm" />
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setImprovedCV(p => ({ ...p, education: [...p.education, { degree: "", institute: "", year: "" }] }))} className="rounded-xl h-8 border-border/60 text-muted-foreground text-xs">
                            <Plus className="w-3.5 h-3.5 mr-1" /> Add Education
                        </Button>
                    </SectionCard>

                    {/* Experience */}
                    <SectionCard title="Experience">
                        <div className="space-y-4">
                            {improvedCV.experience.map((exp, i) => (
                                <div key={i} className="p-4 rounded-xl border border-border/40 bg-muted/20 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Experience {i + 1}</span>
                                        {improvedCV.experience.length > 1 && (
                                            <button onClick={() => setImprovedCV(p => ({ ...p, experience: p.experience.filter((_, idx) => idx !== i) }))} className="text-muted-foreground hover:text-destructive transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    <Input placeholder="Title" value={exp.title} onChange={(e) => { const u = [...improvedCV.experience]; u[i].title = e.target.value; setImprovedCV(p => ({ ...p, experience: u })); }} className="rounded-xl border-border/60 bg-background h-10 text-sm" />
                                    <Input placeholder="Company (optional)" value={exp.company || ""} onChange={(e) => { const u = [...improvedCV.experience]; u[i].company = e.target.value; setImprovedCV(p => ({ ...p, experience: u })); }} className="rounded-xl border-border/60 bg-background h-10 text-sm" />
                                    <Textarea placeholder="Description" value={exp.description} onChange={(e) => { const u = [...improvedCV.experience]; u[i].description = e.target.value; setImprovedCV(p => ({ ...p, experience: u })); }} rows={3} className="rounded-xl border-border/60 bg-background text-sm resize-none" />
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setImprovedCV(p => ({ ...p, experience: [...p.experience, { title: "", company: "", description: "" }] }))} className="rounded-xl h-8 border-border/60 text-muted-foreground text-xs">
                            <Plus className="w-3.5 h-3.5 mr-1" /> Add Experience
                        </Button>
                    </SectionCard>

                    {/* Footer actions */}
                    <div className="flex gap-3 pb-8">
                        <Button variant="ghost" onClick={() => setStep(3)} className="rounded-xl text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                        </Button>
                        <Button
                            onClick={downloadImprovedCV}
                            disabled={improvedCVLoader}
                            className="flex-1 h-11 rounded-xl gradient-primary text-white border-0 font-semibold hover:opacity-90 transition-all hover:shadow-lg"
                        >
                            {improvedCVLoader ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                            Download Improved CV
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
