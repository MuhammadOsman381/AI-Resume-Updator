"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { SidebarTrigger } from "./ui/sidebar";

const NavBar = () => {
    const { data: session } = useSession();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push("/");
    };

    return (
        <nav className="flex w-full items-center  justify-between px-6 py-3 bg-white border-b">
            {/* <SidebarTrigger className="-ml-1" /> */}
            <div
                className="text-xl font-bold text-gray-800 cursor-pointer"
                onClick={() => router.push("/")}
            >
                Resume Updator
            </div>
            {session && (
                <Button variant="destructive" onClick={handleLogout}>
                    Logout
                </Button>
            )}
        </nav>


    );
};

export default NavBar;
