import * as React from "react";
import { GalleryVerticalEnd } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { SidebarOptInForm } from "@/components/sidebar-opt-in-form";
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
import SpinnerLoader from "./SpinnerLoader";

interface CV {
  id: string;
  title: string;
  createdAt: string;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userCVs?: CV[];
  cvID: string;
  setCVID: React.Dispatch<React.SetStateAction<string>>;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}

export function AppSidebar({ userCVs = [], cvID, setCVID, setStep, ...props }: AppSidebarProps) {
  const navMain = userCVs.map((cv) => ({
    title: cv.title,
    url: "#",
    items: [
      {
        title: "Edit",
        url: `#cv-${cv.id}`,
        id: cv.id,
      },
    ],
  }));

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Projects</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {
          userCVs.length === 0 ? (
            <SpinnerLoader size="7" color="black" />
          ) :
            <NavMain items={navMain} setCVID={setCVID} setStep={setStep} />
        }


      </SidebarContent>
      {/* <SidebarFooter>
        <div className="p-1">
          <SidebarOptInForm />
        </div>
      </SidebarFooter> */}
      <SidebarRail />
    </Sidebar>
  );
}
