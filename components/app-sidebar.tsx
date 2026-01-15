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

export function AppSidebar({ userCVs = [], cvID, setCVID, setStep,loading,fetchUserCVs, ...props }: AppSidebarProps) {
  const navMain = userCVs.map((cv) => ({
    title: cv.title,
    url: "#",
    items: [
      {
        title: "Edit",
        url: `#cv-${cv.id}`,
        id: cv.id,
        cvJson:cv.cvJson
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
          loading ? 
          <SpinnerLoader size="7" color="black" /> :
          userCVs.length === 0 ? (
            <i className="text-sm w-full text-center text-gray-400" >
              No User CVs Found
            </i>
          ) :
            <NavMain items={navMain} fetchUserCVs={fetchUserCVs}  setCVID={setCVID} setStep={setStep} />
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
