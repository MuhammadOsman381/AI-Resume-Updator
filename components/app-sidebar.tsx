"use client";

import * as React from "react";
import { GalleryVerticalEnd, Plus, Loader2, Zap } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";

interface CV {
    id: string;
    title: string;
    createdAt: string;
    cvJson: any;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    userCVs?: CV[];
    cvID: string;
    loading: boolean;
    setCVID: React.Dispatch<React.SetStateAction<string>>;
    setStep: React.Dispatch<React.SetStateAction<number>>;
    fetchUserCVs: () => void;
}

export function AppSidebar({
    userCVs = [],
    cvID,
    setCVID,
    setStep,
    loading,
    fetchUserCVs,
    ...props
}: AppSidebarProps) {
    const navMain = userCVs.map((cv) => ({
        title: cv.title,
        url: "#",
        items: [
            { title: "Edit", url: `#cv-${cv.id}`, id: cv.id, cvJson: cv.cvJson },
        ],
    }));

    return (
        <Sidebar
            {...props}
            className="border-r border-border/50 bg-sidebar"
        >
            {/* Header */}
            <SidebarHeader className="border-b border-border/30 px-4 py-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="#" className="flex items-center gap-3 group">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                                    <Zap className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex flex-col leading-tight">
                                    <span className="font-bold text-sm text-sidebar-foreground">ResumeAI</span>
                                    <span className="text-xs text-muted-foreground">Your CVs</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Content */}
            <SidebarContent className="px-3 py-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="text-xs">Loading CVs…</span>
                    </div>
                ) : userCVs.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-16 text-center px-4">
                        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                            <GalleryVerticalEnd className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">No CVs yet</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Upload or build your first CV to get started</p>
                        </div>
                    </div>
                ) : (
                    <NavMain
                        items={navMain}
                        fetchUserCVs={fetchUserCVs}
                        setCVID={setCVID}
                        setStep={setStep}
                    />
                )}
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="border-t border-border/30 px-4 py-3">
                <p className="text-xs text-muted-foreground text-center">
                    {userCVs.length} CV{userCVs.length !== 1 ? "s" : ""} saved
                </p>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}