"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
    Loader2, Upload, Terminal, FileCode, CheckCircle2, 
    Layout, User, Edit, Trash2, Plus, LogOut, Image as ImageIcon 
} from "lucide-react";
import NavBar from "@/components/NavBar";
import { useRouter } from "next/navigation";

export default function AdminPortal() {
    const { toast } = useToast();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"templates" | "profile">("templates");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    // Template State
    const [templates, setTemplates] = useState<any[]>([]);
    const [editingTemplate, setEditingTemplate] = useState<any>(null);
    const [title, setTitle] = useState("");
    const [ejs, setEjs] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [currentImageUrl, setCurrentImageUrl] = useState("");

    // Profile State
    const [admin, setAdmin] = useState<any>(null);
    const [profileName, setProfileName] = useState("");
    const [profileEmail, setProfileEmail] = useState("");
    const [profilePassword, setProfilePassword] = useState("");
    const [profileImage, setProfileImage] = useState<File | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("admin_token");
        const storedAdmin = localStorage.getItem("admin_user");
        if (!token || !storedAdmin) {
            router.push("/admin");
            return;
        }
        const adminData = JSON.parse(storedAdmin);
        setAdmin(adminData);
        setProfileName(adminData.name);
        setProfileEmail(adminData.email);
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setFetching(true);
        try {
            const res = await axios.get("/api/templates");
            if (res.data.status === "ok") {
                setTemplates(res.data.templates);
            }
        } catch (error) {
            console.error("Fetch failed", error);
        } finally {
            setFetching(false);
        }
    };

    const handleTemplateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("ejs", ejs);
            if (image) formData.append("image", image);
            if (editingTemplate) formData.append("id", editingTemplate.id);

            const url = editingTemplate ? "/api/admin/templates/update" : "/api/admin/templates/create";
            const res = await axios.post(url, formData, {
                headers: { 
                    "Content-Type": "multipart/form-data",
                    authorization: localStorage.getItem("admin_token") || ""
                },
            });

            if (res.data.status === "ok") {
                toast({ title: "Success", description: editingTemplate ? "Template updated!" : "Template created!" });
                resetTemplateForm();
                fetchTemplates();
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.response?.data?.message || error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTemplate = async (id: string) => {
        if (!confirm("Are you sure you want to delete this template?")) return;
        try {
            const res = await axios.post("/api/admin/templates/delete", { id }, {
                headers: { authorization: localStorage.getItem("admin_token") || "" }
            });
            if (res.data.status === "ok") {
                toast({ title: "Deleted", description: "Template removed." });
                fetchTemplates();
            }
        } catch (error: any) {
            toast({ title: "Error", description: "Delete failed", variant: "destructive" });
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", profileName);
            formData.append("email", profileEmail);
            if (profilePassword) formData.append("password", profilePassword);
            if (profileImage) formData.append("image", profileImage);

            const res = await axios.post("/api/admin/profile/update", formData, {
                headers: { 
                    "Content-Type": "multipart/form-data",
                    authorization: localStorage.getItem("admin_token") || ""
                }
            });

            if (res.data.status === "ok") {
                const updatedAdmin = res.data.admin;
                localStorage.setItem("admin_user", JSON.stringify(updatedAdmin));
                setAdmin(updatedAdmin);
                setProfilePassword("");
                toast({ title: "Profile Updated", description: "Your changes have been saved." });
            }
        } catch (error: any) {
            toast({ title: "Failed", description: error.response?.data?.message || "Update failed", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const resetTemplateForm = () => {
        setEditingTemplate(null);
        setTitle("");
        setEjs("");
        setImage(null);
        setCurrentImageUrl("");
    };

    const startEditing = (temp: any) => {
        setEditingTemplate(temp);
        setTitle(temp.title);
        setEjs(temp.ejs);
        setCurrentImageUrl(temp.imageUrl);
        setActiveTab("templates");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleLogout = () => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        router.push("/admin");
    };

    const inputCls = "rounded-xl border-border/60 bg-card/40 text-foreground h-11 text-sm focus:border-primary/50 transition-all hover:bg-card/60";
    const textareaCls = "rounded-xl border-border/60 bg-card/40 text-foreground text-sm font-mono resize-none focus:border-primary/50 transition-all hover:bg-card/60 min-h-[400px]";

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-200">
            <NavBar loginPage={false} showSideBarTrigger={false} />

            <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-white/5">
                    <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-primary/20 shadow-sm">
                            <ShieldCheck className="w-3 h-3" /> Command Center
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white">Admin Dashboard</h1>
                        <p className="text-muted-foreground text-sm">System administration and template configuration.</p>
                    </div>

                    <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
                        <button 
                            onClick={() => setActiveTab("templates")}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "templates" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-white/5 hover:text-white"}`}
                        >
                            <Layout className="w-4 h-4" /> Templates
                        </button>
                        <button 
                            onClick={() => setActiveTab("profile")}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "profile" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-white/5 hover:text-white"}`}
                        >
                            <User className="w-4 h-4" /> Profile
                        </button>
                        <button 
                            onClick={handleLogout}
                            className="p-2.5 rounded-xl text-muted-foreground hover:text-destructive transition-colors ml-2"
                            title="Sign Out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {activeTab === "templates" ? (
                    <div className="grid lg:grid-cols-12 gap-8">
                        {/* Form Section */}
                        <div className="lg:col-span-12 xl:col-span-4 space-y-6">
                            <div className="glass-card rounded-[32px] border border-white/5 p-8 space-y-6 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
                                
                                <div className="flex items-center justify-between relative">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        {editingTemplate ? <Edit className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
                                        {editingTemplate ? "Edit Template" : "New Template"}
                                    </h2>
                                    {editingTemplate && (
                                        <Button variant="ghost" size="sm" onClick={resetTemplateForm} className="text-[10px] uppercase font-bold text-muted-foreground hover:text-white">
                                            Cancel
                                        </Button>
                                    )}
                                </div>

                                <form onSubmit={handleTemplateSubmit} className="space-y-5 relative">
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Template Title</Label>
                                            <Input
                                                placeholder="Modern Minimalist"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className={inputCls}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Preview Image</Label>
                                            <div className="group relative">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => { if (e.target.files?.[0]) setImage(e.target.files[0]); }}
                                                    className="hidden"
                                                    id="template-img"
                                                />
                                                <label htmlFor="template-img" className="flex flex-col items-center justify-center w-full aspect-[4/5] rounded-2xl border-2 border-dashed border-white/10 bg-white/5 hover:border-primary/50 transition-all cursor-pointer">
                                                    {image || currentImageUrl ? (
                                                        <img
                                                            src={image ? URL.createObjectURL(image) : currentImageUrl}
                                                            className="w-full h-full object-cover rounded-xl"
                                                            alt="Preview"
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Upload className="w-8 h-8 text-muted-foreground" />
                                                            <span className="text-xs text-muted-foreground">Select Screenshot</span>
                                                        </div>
                                                    )}
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:hidden space-y-1.5">
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">EJS Content</Label>
                                        <Textarea
                                            value={ejs}
                                            onChange={(e) => setEjs(e.target.value)}
                                            className="min-h-[200px] bg-white/5 border-white/10"
                                            required
                                        />
                                    </div>

                                    <Button disabled={loading} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-bold active:scale-[0.98] transition-all">
                                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (editingTemplate ? "Update Configuration" : "Publish Template")}
                                    </Button>
                                </form>
                            </div>
                        </div>

                                    {/* Code Editor Section (Desktop Only) */}
                        <div className="hidden xl:block xl:col-span-8">
                            <div className="glass-card h-full rounded-[32px] border border-white/5 overflow-hidden flex flex-col shadow-2xl">
                                <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileCode className="w-4 h-4 text-primary" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-white/50">EJS Template Source</span>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-400/20" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/20" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-400/20" />
                                    </div>
                                </div>
                                <div className="flex-1 p-0">
                                    <Textarea
                                        value={ejs}
                                        onChange={(e) => setEjs(e.target.value)}
                                        placeholder="Paste your professional template code here..."
                                        className="w-full h-full min-h-[600px] p-8 bg-transparent border-0 focus:ring-0 text-primary text-[13px] font-mono leading-relaxed"
                                    />
                                </div>
                            </div>
                        </div>

                                    {/* Template List Section */}
                        <div className="lg:col-span-12 space-y-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Layout className="w-5 h-5 text-primary" /> 
                                Established Templates
                                {fetching && <Loader2 className="w-4 h-4 animate-spin opacity-40 ml-2" />}
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {templates.map(temp => (
                                    <div key={temp.id} className="group glass-card rounded-[24px] border border-white/5 p-3 space-y-3 hover:border-primary/30 transition-all">
                                        <div className="relative aspect-[3/4] rounded-[18px] overflow-hidden bg-black shadow-inner">
                                            <img src={temp.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={temp.title} />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                <button onClick={() => startEditing(temp)} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center border border-white/10">
                                                    <Edit className="w-4 h-4 text-white" />
                                                </button>
                                                <button onClick={() => handleDeleteTemplate(temp.id)} className="w-10 h-10 bg-destructive/10 hover:bg-destructive/20 rounded-xl flex items-center justify-center border border-destructive/20">
                                                    <Trash2 className="w-4 h-4 text-destructive" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="px-1 py-1">
                                            <p className="text-sm font-bold text-white truncate">{temp.title}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Dynamic Config</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-xl mx-auto">
                        <div className="glass-card rounded-[32px] border border-white/5 p-10 space-y-8 shadow-2xl relative">
                            <div className="text-center space-y-4">
                                <div className="relative w-24 h-24 mx-auto">
                                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl scale-125" />
                                    <img 
                                        src={admin?.image || profileImage ? (profileImage ? URL.createObjectURL(profileImage) : admin.image) : `https://ui-avatars.com/api/?name=${profileName}`} 
                                        className="relative w-24 h-24 rounded-[32px] border-2 border-white/10 object-cover shadow-2xl" 
                                    />
                                    <label htmlFor="p-img" className="absolute bottom-[-8px] right-[-8px] w-8 h-8 bg-primary rounded-xl flex items-center justify-center border-2 border-[#0a0a0c] cursor-pointer shadow-lg hover:scale-110 transition-transform">
                                        <ImageIcon className="w-4 h-4 text-white" />
                                        <input type="file" onChange={(e) => { if (e.target.files?.[0]) setProfileImage(e.target.files[0]); }} id="p-img" className="hidden" />
                                    </label>
                                </div>
                                <h2 className="text-2xl font-extrabold text-white">Administrator Access</h2>
                            </div>

                            <form onSubmit={handleProfileUpdate} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Identity Name</Label>
                                        <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} className={inputCls} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Terminal Email</Label>
                                        <Input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} className={inputCls} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Reset Key (Optional)</Label>
                                        <Input type="password" placeholder="New Terminal Key" value={profilePassword} onChange={(e) => setProfilePassword(e.target.value)} className={inputCls} />
                                    </div>
                                </div>

                                <Button disabled={loading} className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20 group active:scale-[0.98] transition-all">
                                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Authorize Profile Changes"}
                                </Button>
                            </form>
                        </div>
                    </div>
                )}
            </main>

            <style jsx global>{`
                .glass-card {
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                }
                .gradient-text {
                    background: linear-gradient(135deg, #fff 0%, #ffffff80 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            `}</style>
        </div>
    );
}

function ShieldCheck({ className }: { className?: string }) {
    return <Terminal className={className} />;
}
