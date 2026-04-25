"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import NavBar from "@/components/NavBar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Loader2, Upload, FileText, ClipboardList } from "lucide-react";
import { CVFormData } from "@/types/cv";

interface DashboardStepProps {
    fetchUserCVs: () => void;
    userCVs: any[];
    cvID: string;
    setCVID: any;
    setStep: any;
    loading: boolean;
    uploadCV: any;
    setUploadCV: (data: any) => void;
    handleUploadSubmit: () => void;
    postCVLoading: boolean;
    title: string;
    setTitle: (title: string) => void;
    form: CVFormData;
    updateField: (field: any, value: any) => void;
    updateArrayField: (field: any, index: number, value: any) => void;
    updateObjectArrayField: (field: any, index: number, key: any, value: any) => void;
    addItem: (field: any, emptyItem: any) => void;
    removeItem: (field: any, index: number) => void;
    handleSubmit: () => void;
    text: string;
    setText: (text: string) => void;
    handleStringCVSubmit: () => void;
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

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</Label>
            {children}
        </div>
    );
}

const inputCls = "rounded-xl border-border/60 bg-background text-foreground h-10 text-sm focus:border-primary/50 transition-colors";
const textareaCls = "rounded-xl border-border/60 bg-background text-foreground text-sm resize-none focus:border-primary/50 transition-colors";

export function DashboardStep({
    fetchUserCVs, userCVs, cvID, setCVID, setStep, loading,
    uploadCV, setUploadCV, handleUploadSubmit, postCVLoading,
    title, setTitle, form, updateField, updateArrayField,
    updateObjectArrayField, addItem, removeItem, handleSubmit,
    text, setText, handleStringCVSubmit,
}: DashboardStepProps) {
    return (
        <SidebarProvider>
            <div className="w-full h-screen flex overflow-hidden bg-background">
                <AppSidebar
                    fetchUserCVs={fetchUserCVs}
                    userCVs={userCVs}
                    cvID={cvID}
                    setCVID={setCVID}
                    setStep={setStep}
                    loading={loading}
                />
                <SidebarInset className="flex flex-col flex-1 overflow-hidden">
                    <NavBar loginPage={false} showSideBarTrigger={true} />

                    <div className="flex-1 overflow-auto p-5 bg-background">
                        <Tabs defaultValue="upload" className="w-full space-y-5">
                            <TabsList className="w-full h-12 bg-muted/50 border border-border/40 rounded-2xl p-1 gap-1">
                                <TabsTrigger value="upload" className="flex-1 rounded-xl text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all gap-2">
                                    <Upload className="w-4 h-4" /> Upload CV
                                </TabsTrigger>
                                <TabsTrigger value="form" className="flex-1 rounded-xl text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all gap-2">
                                    <ClipboardList className="w-4 h-4" /> Build (Form)
                                </TabsTrigger>
                                <TabsTrigger value="text" className="flex-1 rounded-xl text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all gap-2">
                                    <FileText className="w-4 h-4" /> Build (Text)
                                </TabsTrigger>
                            </TabsList>

                            {/* ── UPLOAD TAB ── */}
                            <TabsContent value="upload">
                                <SectionCard title="Upload your CV / Resume">
                                    <FieldGroup label="Title">
                                        <Input
                                            type="text"
                                            placeholder="e.g. My Software Engineer CV"
                                            value={uploadCV.title}
                                            onChange={(e) => setUploadCV({ ...uploadCV, title: e.target.value })}
                                            className={inputCls}
                                        />
                                    </FieldGroup>
                                    <FieldGroup label="PDF File">
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                onChange={(e) => {
                                                    if (!e.target.files) return;
                                                    setUploadCV({ ...uploadCV, file: e.target.files[0] });
                                                }}
                                                className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer border border-border/60 rounded-xl px-3 py-2.5 bg-background transition-colors"
                                            />
                                        </div>
                                        {uploadCV.file && (
                                            <p className="text-xs text-muted-foreground mt-1">📎 {uploadCV.file.name}</p>
                                        )}
                                    </FieldGroup>
                                    <Button
                                        disabled={!uploadCV.title || !uploadCV.file || postCVLoading}
                                        onClick={handleUploadSubmit}
                                        className="h-10 rounded-xl gradient-primary text-white border-0 font-semibold hover:opacity-90 transition-all disabled:opacity-40"
                                    >
                                        {postCVLoading ? (
                                            <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</span>
                                        ) : (
                                            <span className="flex items-center gap-2"><Upload className="w-4 h-4" /> Upload CV</span>
                                        )}
                                    </Button>
                                </SectionCard>
                            </TabsContent>

                            {/* ── FORM TAB ── */}
                            <TabsContent value="form" className="overflow-auto pb-10 space-y-4">
                                <SectionCard title="CV Title">
                                    <FieldGroup label="Title">
                                        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Full Stack Engineer CV" className={inputCls} />
                                    </FieldGroup>
                                </SectionCard>

                                <SectionCard title="Basic Information">
                                    <FieldGroup label="Name">
                                        <Input value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="John Doe" className={inputCls} />
                                    </FieldGroup>
                                    <FieldGroup label="Position">
                                        <Input value={form.position} onChange={(e) => updateField("position", e.target.value)} placeholder="Software Engineer" className={inputCls} />
                                    </FieldGroup>
                                    <FieldGroup label="Summary">
                                        <Textarea value={form.summary} onChange={(e) => updateField("summary", e.target.value)} rows={4} placeholder="Brief professional summary…" className={textareaCls} />
                                    </FieldGroup>
                                </SectionCard>

                                <SectionCard title="Links">
                                    <div className="space-y-2">
                                        {form.links.map((link, i) => (
                                            <div key={i} className="flex gap-2">
                                                <Input placeholder="https://..." value={link} onChange={(e) => updateArrayField("links", i, e.target.value)} className={inputCls} />
                                                {form.links.length > 1 && (
                                                    <Button size="icon" variant="ghost" onClick={() => removeItem("links", i)} className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => addItem("links", "")} className="rounded-xl border-border/60 text-muted-foreground text-xs h-8">
                                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Link
                                    </Button>
                                </SectionCard>

                                <SectionCard title="Tech Stack">
                                    <div className="space-y-2">
                                        {form.tech_stack.map((tech, i) => (
                                            <div key={i} className="flex gap-2">
                                                <Input placeholder="React, Node.js, Python…" value={tech} onChange={(e) => updateArrayField("tech_stack", i, e.target.value)} className={inputCls} />
                                                {form.tech_stack.length > 1 && (
                                                    <Button size="icon" variant="ghost" onClick={() => removeItem("tech_stack", i)} className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => addItem("tech_stack", "")} className="rounded-xl border-border/60 text-muted-foreground text-xs h-8">
                                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Skill
                                    </Button>
                                </SectionCard>

                                <SectionCard title="Projects">
                                    <div className="space-y-4">
                                        {form.projects.map((project, i) => (
                                            <div key={i} className="p-4 rounded-xl border border-border/40 bg-muted/20 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Project {i + 1}</span>
                                                    {form.projects.length > 1 && (
                                                        <button onClick={() => removeItem("projects", i)} className="text-muted-foreground hover:text-destructive transition-colors">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                                <Input placeholder="Project Title" value={project.title} onChange={(e) => updateObjectArrayField("projects", i, "title", e.target.value)} className={inputCls} />
                                                <Textarea placeholder="Description" value={project.description} onChange={(e) => updateObjectArrayField("projects", i, "description", e.target.value)} rows={3} className={textareaCls} />
                                                <Input placeholder="Project Link" value={project.link} onChange={(e) => updateObjectArrayField("projects", i, "link", e.target.value)} className={inputCls} />
                                            </div>
                                        ))}
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => addItem("projects", { title: "", description: "", link: "" })} className="rounded-xl border-border/60 text-muted-foreground text-xs h-8">
                                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Project
                                    </Button>
                                </SectionCard>

                                <SectionCard title="Education">
                                    <div className="space-y-4">
                                        {form.education.map((edu, i) => (
                                            <div key={i} className="p-4 rounded-xl border border-border/40 bg-muted/20 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Education {i + 1}</span>
                                                    {form.education.length > 1 && (
                                                        <button onClick={() => removeItem("education", i)} className="text-muted-foreground hover:text-destructive transition-colors">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                                <Input placeholder="Degree" value={edu.degree} onChange={(e) => updateObjectArrayField("education", i, "degree", e.target.value)} className={inputCls} />
                                                <Input placeholder="Institute" value={edu.institute} onChange={(e) => updateObjectArrayField("education", i, "institute", e.target.value)} className={inputCls} />
                                                <Input placeholder="Year" value={edu.year} onChange={(e) => updateObjectArrayField("education", i, "year", e.target.value)} className={inputCls} />
                                            </div>
                                        ))}
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => addItem("education", { degree: "", institute: "", year: "" })} className="rounded-xl border-border/60 text-muted-foreground text-xs h-8">
                                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Education
                                    </Button>
                                </SectionCard>

                                <SectionCard title="Experience">
                                    <div className="space-y-4">
                                        {form.experience.map((exp, i) => (
                                            <div key={i} className="p-4 rounded-xl border border-border/40 bg-muted/20 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Experience {i + 1}</span>
                                                    {form.experience.length > 1 && (
                                                        <button onClick={() => removeItem("experience", i)} className="text-muted-foreground hover:text-destructive transition-colors">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                                <Input placeholder="Title" value={exp.title} onChange={(e) => updateObjectArrayField("experience", i, "title", e.target.value)} className={inputCls} />
                                                <Input placeholder="Company (optional)" value={exp.company || ""} onChange={(e) => updateObjectArrayField("experience", i, "company", e.target.value)} className={inputCls} />
                                                <Textarea placeholder="Description" value={exp.description} onChange={(e) => updateObjectArrayField("experience", i, "description", e.target.value)} rows={3} className={textareaCls} />
                                            </div>
                                        ))}
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => addItem("experience", { title: "", company: "", description: "" })} className="rounded-xl border-border/60 text-muted-foreground text-xs h-8">
                                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Experience
                                    </Button>
                                </SectionCard>

                                <Button onClick={handleSubmit} className="w-full h-12 rounded-xl gradient-primary text-white border-0 font-semibold hover:opacity-90 transition-all hover:shadow-lg mt-2">
                                    Save CV
                                </Button>
                            </TabsContent>

                            {/* ── TEXT TAB ── */}
                            <TabsContent value="text" className="space-y-4">
                                <SectionCard title="Paste Your CV">
                                    <FieldGroup label="Title">
                                        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. My Engineer CV" className={inputCls} />
                                    </FieldGroup>
                                    <FieldGroup label="CV Text">
                                        <Textarea
                                            rows={22}
                                            className={`${textareaCls} w-full leading-relaxed`}
                                            placeholder="Paste the full text content of your CV here. Our AI will extract and structure it automatically…"
                                            onChange={(e) => setText(e.target.value)}
                                            value={text}
                                        />
                                    </FieldGroup>
                                    <Button
                                        disabled={!title || !text || postCVLoading}
                                        onClick={handleStringCVSubmit}
                                        className="h-10 rounded-xl gradient-primary text-white border-0 font-semibold hover:opacity-90 transition-all disabled:opacity-40"
                                    >
                                        {postCVLoading ? (
                                            <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Parsing…</span>
                                        ) : (
                                            "Parse & Save CV"
                                        )}
                                    </Button>
                                </SectionCard>
                            </TabsContent>
                        </Tabs>
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
