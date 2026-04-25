"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useGetAndDelete from "@/hooks/useGetAndDelete";
import axios from "axios";
import Image from "next/image";
import { SidebarTrigger } from "./ui/sidebar";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon, LogOut, Trash2, ChevronDown, Zap } from "lucide-react";

const NavBar = ({
    showSideBarTrigger,
    loginPage,
}: {
    showSideBarTrigger: boolean;
    loginPage?: boolean;
}) => {
    const { data: session } = useSession();
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();

    const fetchUserHook = useGetAndDelete(axios.get);
    const [user, setUser] = useState<any>(null);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push("/");
    };

    const handleDeleteAccount = async () => {
        alert("Delete account clicked");
    };

    const getUserDetails = async () => {
        try {
            const response = await fetchUserHook.callApi("user/me", true, false);
            if (response?.status === "ok") {
                setUser(response.data[0]);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getUserDetails();
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <nav className="relative flex w-full items-center justify-between px-5 h-16 bg-card/80 backdrop-blur-md border-b border-border/50 z-50 transition-colors duration-300">
            {/* LEFT: Logo + Sidebar trigger */}
            <div className="flex items-center gap-3">
                {showSideBarTrigger && (
                    <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
                )}
                <button
                    onClick={() => router.push("/")}
                    className="flex items-center gap-2 group"
                >
                    <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
                        <Zap className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[15px] font-bold tracking-tight text-foreground">
                        Resume<span className="text-gradient">{" "}AI</span>
                    </span>
                </button>
            </div>

            {/* CENTER: Nav links */}
            {!loginPage && (
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 bg-muted/60 rounded-full px-2 py-1.5 border border-border/40">
                    <button
                        onClick={() => router.push("/user")}
                        className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background rounded-full px-4 py-1.5 transition-all duration-200"
                    >
                        CV Builder
                    </button>
                    <button
                        onClick={() => router.push("/user/excel-job-apply")}
                        className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background rounded-full px-4 py-1.5 transition-all duration-200"
                    >
                        Apply Jobs
                    </button>
                </div>
            )}

            {/* RIGHT: Theme toggle + User menu */}
            <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-border/60 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105"
                    aria-label="Toggle theme"
                >
                    {theme === "dark" ? (
                        <Sun className="w-4 h-4" />
                    ) : (
                        <Moon className="w-4 h-4" />
                    )}
                </button>

                {/* User Avatar Dropdown */}
                {user && !loginPage && (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setOpen(!open)}
                            className="flex items-center gap-2.5 cursor-pointer rounded-xl px-2.5 py-1.5 hover:bg-muted/70 transition-all duration-200 group"
                        >
                            <Image
                                src={user.image}
                                alt="profile"
                                width={34}
                                height={34}
                                className="rounded-full ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all"
                            />
                            <div className="hidden sm:flex flex-col text-left">
                                <span className="font-semibold text-[13px] text-foreground leading-tight">
                                    {user.name}
                                </span>
                                <span className="text-[11px] text-muted-foreground leading-tight">
                                    {user.email}
                                </span>
                            </div>
                            <ChevronDown
                                className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                            />
                        </button>

                        {/* Dropdown */}
                        {open && (
                            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-xl p-1.5 space-y-0.5 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                                {/* User info header */}
                                <div className="px-3 py-2.5 mb-1 border-b border-border/40">
                                    <p className="text-sm font-semibold text-foreground">{user.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                </div>

                                {/* Mobile routes */}
                                <div className="md:hidden space-y-0.5 pb-1 border-b border-border/40 mb-1">
                                    <button
                                        onClick={() => { router.push("/user"); setOpen(false); }}
                                        className="w-full text-left px-3 py-2 text-sm rounded-xl hover:bg-muted/60 text-foreground transition-colors"
                                    >
                                        CV Builder
                                    </button>
                                    <button
                                        onClick={() => { router.push("/user/excel-job-apply"); setOpen(false); }}
                                        className="w-full text-left px-3 py-2 text-sm rounded-xl hover:bg-muted/60 text-foreground transition-colors"
                                    >
                                        Apply Jobs
                                    </button>
                                </div>

                                {/* Actions */}
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl hover:bg-muted/60 text-foreground transition-colors"
                                >
                                    <LogOut className="w-4 h-4 text-muted-foreground" />
                                    Sign out
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl hover:bg-destructive/10 text-destructive transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Account
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    )
}
export default NavBar;

