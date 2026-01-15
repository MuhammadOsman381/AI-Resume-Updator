"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useGetAndDelete from "@/hooks/useGetAndDelete";
import axios from "axios";
import Image from "next/image";
import { SidebarTrigger } from "./ui/sidebar";

const NavBar = ({ showSideBarTrigger, loginPage }: { showSideBarTrigger: boolean, loginPage?: boolean }) => {
    const { data: session } = useSession();
    const router = useRouter();

    const fetchUserHook = useGetAndDelete(axios.get);

    const [user, setUser] = useState<any>(null);
    const [open, setOpen] = useState(false);

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push("/");
    };

    const handleDeleteAccount = async () => {
        // call delete API here
        alert("Delete account clicked");
    };

    const getUserDetails = async () => {
        try {
            const response = await fetchUserHook.callApi("user/me", true, false);
            if (response?.status === "ok") {
                console.log(response.data[0])
                setUser(response.data[0]);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getUserDetails();
    }, []);

    return (
                <nav className="flex w-full items-center justify-between px-6 py-1 h-16  bg-zinc-50 border-b">
        <div className="flex items-center justify-center" >
                {showSideBarTrigger && <SidebarTrigger />}
                <div
                    className="text-[19px] font-bold text-gray-800 cursor-pointer"
                    onClick={() => router.push("/")}
                >
                    Resume Enhancer
                </div>
            </div>

            {user && !loginPage && (
                <div className="relative">
                    <div
                        onClick={() => setOpen(!open)}
                        className="flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 hover:bg-gray-100"
                    >
                        <Image
                            src={user.image}
                            alt="profile"
                            width={40}
                            height={40}
                            className="rounded-full"
                        />
                        <div className="flex flex-col">
                            <span className="font-medium text-sm">
                                {user.name}
                            </span>
                            <span className="text-xs text-gray-500">
                                {user.email}
                            </span>
                        </div>
                    </div>

                    {/* ACTIONS */}
                    {open && (
                        <div className="absolute right-0 mt-2 w-40 rounded-lg border bg-white shadow-md p-2 space-y-2">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={handleLogout}
                            >
                                Logout
                            </Button>

                            <Button
                                variant="destructive"
                                className="w-full"
                                onClick={handleDeleteAccount}
                            >
                                Delete Account
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default NavBar;
