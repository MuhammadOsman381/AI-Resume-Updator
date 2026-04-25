"use client";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import usePostAndPut from "@/hooks/usePostAndPut";
import useGetAndDelete from "@/hooks/useGetAndDelete";
import axios from "axios";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    X,
    Plus,
    Briefcase,
    FilePlus,
    Loader2,
    Send,
    Trash2,
    ChevronDown,
    CheckCircle2,
    Clock,
    Mail,
    LayoutTemplate,
    FileText,
} from "lucide-react";

interface Jobs {
    id: string;
    title: string;
    description: string;
    emails: string[];
    status: string;
}

interface CV {
    id: string;
    title: string;
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

const inputCls = "rounded-xl border-border/60 bg-background text-foreground h-10 text-sm focus:border-primary/50 transition-colors";
const textareaCls = "rounded-xl border-border/60 bg-background text-foreground text-sm resize-none focus:border-primary/50 transition-colors";

const Page = () => {
    const { toast } = useToast();
    const [jobs, setJobs] = useState<Jobs[]>([]);
    const [userCVs, setUserCVs] = useState<CV[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState("temp1");
    const [selectedCV, setSelectedCV] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [emails, setEmails] = useState([""]);

    const userJob = useGetAndDelete(axios.get);
    const getUserCVsHook = useGetAndDelete(axios.get);
    const applyJobHook = usePostAndPut(axios.post);
    const deleteJobHook = useGetAndDelete(axios.delete);
    const createJobHook = usePostAndPut(axios.post);

    const handleEmailChange = (index: number, value: string) => {
        const updated = [...emails];
        updated[index] = value;
        setEmails(updated);
    };

    const addEmailField = () => setEmails([...emails, ""]);
    const removeEmailField = (index: number) => setEmails(emails.filter((_, i) => i !== index));

    const handleSave = () => {
        if (!title.trim()) return toast({ title: "Title required", description: "Please enter a job title.", variant: "destructive" });
        const payload = {
            title,
            description,
            emails: emails.filter((e) => e.trim() !== ""),
        };
        createJobHook.callApi("jobs/create", payload, true, false, true)
            .then(async () => {
                setTitle(""); setDescription(""); setEmails([""]);
                await getUserJobs();
                toast({ title: "Job saved!", description: "Job details have been saved successfully." });
            })
            .catch(() => toast({ title: "Failed", description: "Could not save job. Please try again.", variant: "destructive" }));
    };

    const getUserJobs = async () => {
        const res = await userJob.callApi("jobs/get", true, false);
        setJobs(res?.jobs ?? []);
    };

    const fetchUserCVs = async () => {
        const res = await getUserCVsHook.callApi("user/cv", true, false);
        if (res?.status === "ok") {
            setUserCVs(res.data);
            if (res.data.length > 0) setSelectedCV(res.data[0].id);
        } else {
            setUserCVs([]);
        }
    };

    useEffect(() => {
        getUserJobs();
        fetchUserCVs();
    }, []);

    const templates = ["temp1", "temp2"];

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

            {/* Page header */}
            <div className="space-y-1">
                <h1 className="text-2xl font-bold text-foreground">Apply Jobs</h1>
                <p className="text-sm text-muted-foreground">Save job listings and send AI-tailored applications directly to recruiters.</p>
            </div>

            <Tabs defaultValue="details" className="w-full space-y-5">
                <TabsList className="h-11 bg-muted/50 border border-border/40 rounded-2xl p-1 gap-1 w-full">
                    <TabsTrigger value="details" className="flex-1 rounded-xl text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all gap-2">
                        <FilePlus className="w-4 h-4" /> Add Job
                    </TabsTrigger>
                    <TabsTrigger value="jobs" className="flex-1 rounded-xl text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all gap-2">
                        <Briefcase className="w-4 h-4" /> My Jobs
                        {jobs.length > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                                {jobs.length}
                            </span>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* ── ADD JOB TAB ── */}
                <TabsContent value="details">
                    <SectionCard title="Job Details">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Job Title</Label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Senior Frontend Engineer"
                                className={inputCls}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Job Description</Label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Paste the job description here…"
                                rows={6}
                                className={textareaCls}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5" /> Recruiter Emails
                            </Label>
                            <div className="space-y-2">
                                {emails.map((email, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => handleEmailChange(idx, e.target.value)}
                                            placeholder="recruiter@company.com"
                                            className={inputCls}
                                        />
                                        {emails.length > 1 && (
                                            <button
                                                onClick={() => removeEmailField(idx)}
                                                className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" size="sm" onClick={addEmailField} className="rounded-xl h-8 border-border/60 text-muted-foreground text-xs">
                                <Plus className="w-3.5 h-3.5 mr-1" /> Add Email
                            </Button>
                        </div>

                        <Button
                            onClick={handleSave}
                            disabled={createJobHook.loading || !title.trim()}
                            className="h-11 rounded-xl gradient-primary text-white border-0 font-semibold hover:opacity-90 transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-40"
                        >
                            {createJobHook.loading ? (
                                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving…</span>
                            ) : (
                                "Save Job"
                            )}
                        </Button>
                    </SectionCard>
                </TabsContent>

                {/* ── JOBS TAB ── */}
                <TabsContent value="jobs" className="space-y-4">
                    {/* Toolbar */}
                    <div className="rounded-2xl border border-border/60 bg-card p-4 flex flex-wrap items-end gap-4">
                        {/* Template selector */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                                <LayoutTemplate className="w-3.5 h-3.5" /> Template
                            </label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="w-36 rounded-xl border-border/60 text-foreground justify-between">
                                        {selectedTemplate} <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="rounded-xl border-border/60 bg-card">
                                    {templates.map((t) => (
                                        <DropdownMenuItem key={t} onClick={() => setSelectedTemplate(t)} className="rounded-lg">
                                            {t}
                                            {selectedTemplate === t && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-primary" />}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* CV selector */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5" /> CV
                            </label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="w-52 rounded-xl border-border/60 text-foreground justify-between">
                                        <span className="truncate">{userCVs.find((cv) => cv.id === selectedCV)?.title || "Select CV"}</span>
                                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="rounded-xl border-border/60 bg-card w-56">
                                    {userCVs.length === 0 ? (
                                        <DropdownMenuItem disabled className="text-muted-foreground text-xs">No CVs found</DropdownMenuItem>
                                    ) : (
                                        userCVs.map((cv) => (
                                            <DropdownMenuItem key={cv.id} onClick={() => setSelectedCV(cv.id)} className="rounded-lg">
                                                <span className="truncate">{cv.title}</span>
                                                {selectedCV === cv.id && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-primary flex-shrink-0" />}
                                            </DropdownMenuItem>
                                        ))
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Job list */}
                    {userJob.loading ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span className="text-sm">Loading jobs…</span>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-20 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                                <Briefcase className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="font-semibold text-foreground">No jobs added yet</p>
                                <p className="text-sm text-muted-foreground mt-0.5">Add a job from the "Add Job" tab to get started.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {jobs.map((job) => {
                                const isApplied = job.status.toLowerCase() === "applied";
                                return (
                                    <div key={job.id} className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
                                        {/* Card header */}
                                        <div className="px-5 py-4 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isApplied ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-amber-100 dark:bg-amber-900/40"}`}>
                                                    {isApplied
                                                        ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                        : <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                                    }
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-foreground text-sm truncate">{job.title}</p>
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isApplied
                                                        ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400"
                                                        : "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400"
                                                        }`}>
                                                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <Button
                                                    size="sm"
                                                    onClick={async () => {
                                                        try {
                                                            await applyJobHook.callApi("jobs/apply-single", { id: job.id, cvId: selectedCV, template: selectedTemplate }, true, false, true);
                                                            await getUserJobs();
                                                        } catch (err) {
                                                            toast({ title: "Failed to apply", description: "Please try again.", variant: "destructive" });
                                                        }
                                                    }}
                                                    disabled={applyJobHook.loading}
                                                    className="h-8 rounded-xl gradient-primary text-white border-0 text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                                                >
                                                    {applyJobHook.loading
                                                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        : <><Send className="w-3.5 h-3.5 mr-1.5" />{isApplied ? "Reapply" : "Apply"}</>
                                                    }
                                                </Button>
                                                <button
                                                    onClick={async () => {
                                                        await deleteJobHook.callApi(`jobs/delete/${job.id}`, true, false);
                                                        await getUserJobs();
                                                    }}
                                                    disabled={deleteJobHook.loading}
                                                    className="w-8 h-8 flex items-center justify-center rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                                                >
                                                    {deleteJobHook.loading
                                                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        : <Trash2 className="w-3.5 h-3.5" />
                                                    }
                                                </button>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        {job.description && (
                                            <div className="px-5 pb-3 border-t border-border/30">
                                                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                                                    {job.description.split("•").map((line, idx) => {
                                                        const trimmed = line.trim();
                                                        if (!trimmed) return null;
                                                        return <p key={idx} className="leading-relaxed">{trimmed}</p>;
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Emails */}
                                        {job.emails.length > 0 && (
                                            <div className="px-5 pb-4 mt-1">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {job.emails.map((email, idx) => (
                                                        <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted/60 border border-border/40 text-xs text-muted-foreground">
                                                            <Mail className="w-3 h-3" /> {email}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Page;
