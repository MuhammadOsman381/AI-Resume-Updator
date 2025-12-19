"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const NavBar = () => {
    const { data: session } = useSession();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push("/");
    };

    return (
        <nav className="flex items-center justify-between px-6 py-3 bg-white  border-b">
            <div className="text-xl font-bold text-gray-800 cursor-pointer" onClick={() => router.push("/")}>
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
