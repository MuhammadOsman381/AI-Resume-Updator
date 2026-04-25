"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, Mail, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post("/api/admin/login", { email, password });
            if (res.data.status === "ok") {
                localStorage.setItem("admin_token", res.data.token);
                localStorage.setItem("admin_user", JSON.stringify(res.data.admin));
                toast({
                    title: "Access Granted",
                    description: "Welcome back, Admiral.",
                });
                router.push("/admin/templates");
            } else {
                throw new Error(res.data.message || "Invalid credentials");
            }
        } catch (error: any) {
            toast({
                title: "Access Denied",
                description: error.response?.data?.message || error.message || "Login failed",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/30 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/20 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-[420px] relative z-10 glass-card p-10 rounded-[32px] border border-white/5 shadow-2xl space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto border border-primary/20 shadow-inner">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Console</h1>
                    <p className="text-muted-foreground text-sm">Restricted Area. Authorized Access Only.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Email Terminal</Label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="email"
                                    placeholder="admin@console.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 bg-white/5 border-white/10 rounded-xl pl-11 text-white focus:ring-primary/40 focus:border-primary/40 placeholder:text-muted-foreground/30 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Master Key</Label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 bg-white/5 border-white/10 rounded-xl pl-11 text-white focus:ring-primary/40 focus:border-primary/40 placeholder:text-muted-foreground/30 transition-all"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-13 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-base shadow-xl shadow-primary/20 group active:scale-[0.98] transition-all"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <span className="flex items-center gap-2">
                                Authenticate
                                <Lock className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                            </span>
                        )}
                    </Button>
                </form>

                <div className="pt-4 text-center">
                    <button 
                        type="button"
                        onClick={async () => {
                            try {
                                const res = await axios.post("/api/admin/seed");
                                toast({ title: "Seed Status", description: res.data.message });
                            } catch (e: any) {
                                toast({ title: "Seed Error", description: e.response?.data?.message || e.message, variant: "destructive" });
                            }
                        }}
                        className="text-[10px] text-muted-foreground/40 hover:text-primary transition-colors uppercase tracking-widest font-semibold"
                    >
                        Initialize System Database
                    </button>
                </div>
            </div>

            <style jsx global>{`
                .glass-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                }
            `}</style>
        </div>
    );
}
