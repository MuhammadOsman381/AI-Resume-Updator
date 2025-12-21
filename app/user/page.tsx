"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import usePostAndPut from "@/hooks/usePostAndPut";
import NavBar from "@/components/NavBar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import useGetAndDelete from "@/hooks/useGetAndDelete";
import SpinnerLoader from "@/components/SpinnerLoader";
import { useRouter } from "next/navigation";

interface UploadCV {
    title: string;
    file: File | null;
}

export default function Home() {
    const defaultUploadCV = { title: "", file: null };
    const [step, setStep] = useState(1);
    const [template, setTemplate] = useState("");
    const [uploadCV, setUploadCV] = useState<UploadCV>(defaultUploadCV);
    const [cvID, setCVID] = useState("");
    const [userCVs, setUserCVs] = useState<any[]>([]);
    const [loader, setLoader] = useState<boolean>(false);

    const router = useRouter();

    const postCV = usePostAndPut(axios.post);
    const jobDescription = usePostAndPut(axios.post);
    const getUserCVsHook = useGetAndDelete(axios.get);
    const downloadCVHook = useGetAndDelete(axios.get);

    const [text, setText] = useState("");

    const handleUploadSubmit = async () => {
        const formData = new FormData();
        formData.append("title", uploadCV.title);
        uploadCV.file && formData.append("file", uploadCV.file);
        const response = await postCV.callApi("upload/cv", formData, true, true, true);
        if (response && response.status === "ok") {
            setCVID(response.userCV.insertId);
            setStep(2);
        }
    };

    const handleFinalSubmit = async () => {
        const payload = {
            cvID: cvID,
            jobDescription: text,
            template: template,
        };
        setLoader(true);
        try {
            const res = await axios.post(
                `/api/user/update-cv`,
                payload, // 👈 POST body
                {
                    headers: {
                        authorization: localStorage.getItem("authorization") || "",
                    },
                    responseType: "blob", // 👈 important for PDF
                }
            );

            const blob = new Blob([res.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `cv-${cvID}-${template}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("PDF download failed", error);
        } finally {
            setLoader(false);
        }
    };


    const fetchUserCVs = async () => {
        const res = await getUserCVsHook.callApi("user/cv", true, false);
        if (res && res.status === "ok") {
            setUserCVs(res.data);
        }
        else {
            setUserCVs([]);
        }
    };

    const downloadCV = async () => {
        try {
            setLoader(true);
            const res = await axios.get(
                `/api/download/cv/${cvID}/${template}`,
                {
                    headers: {
                        authorization: localStorage.getItem("authorization") || "",
                    },
                    responseType: "blob",
                }
            );

            const blob = new Blob([res.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `cv-${cvID}-${template}.pdf`;
            document.body.appendChild(a);
            a.click();

            a.remove();
            window.URL.revokeObjectURL(url);
            setLoader(false);
        } catch (error) {
            console.error("PDF download failed", error);
            setLoader(false);
        }
    };


    useEffect(() => {
        if (!localStorage.getItem("authorization")) {
            router.push("/");
        }
    }, []);




    useEffect(() => {
        fetchUserCVs();
    }, []);

    if (step === 1) {
        return (
            <SidebarProvider>
                <div className="w-full h-screen flex flex-col bg-gray-50">
                    <div className="flex flex-1 overflow-hidden">
                        <AppSidebar userCVs={userCVs} cvID={cvID} setCVID={setCVID} setStep={setStep} />
                        <SidebarInset>
                            <NavBar />
                            <div className="flex flex-1 flex-col gap-4 p-4 overflow-auto">
                                <div className="w-full h-full p-4">
                                    <div className="grid border rounded-xl p-4 w-full bg-white gap-3">
                                        <div className="flex flex-col gap-2">
                                            <Label>Enter title</Label>
                                            <Input
                                                type="text"
                                                onChange={(e) =>
                                                    setUploadCV({ ...uploadCV, title: e.target.value })
                                                }
                                            />
                                            <Label>Upload your CV/Resume</Label>
                                            <Input
                                                type="file"
                                                accept="application/pdf"
                                                onChange={(e) => {
                                                    if (!e.target.files) return;
                                                    setUploadCV({ ...uploadCV, file: e.target.files[0] });
                                                }}
                                            />
                                            <div>
                                                <Button
                                                    disabled={!uploadCV.title || !uploadCV.file || postCV.loading}
                                                    size="sm"
                                                    onClick={handleUploadSubmit}>
                                                    {
                                                        postCV.loading ?
                                                            <span className="flex  items-center justify-center gap-1">
                                                                Uploading <SpinnerLoader size="5" color="white" />
                                                            </span>
                                                            : "Submit CV "
                                                    }
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SidebarInset>
                    </div>
                </div>
            </SidebarProvider>
        );
    }

    if (step === 2) {
        return (
            <div className="w-full border h-screen bg-gray-50">
                <NavBar />
                <div className="p-4">
                    <div className="bg-white border p-4 rounded-xl grid w-full max-w-full items-center gap-3">
                        <Label>Select Template</Label>
                        <Select onValueChange={(value) => setTemplate(value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose Template" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="temp1">Template 1</SelectItem>
                                <SelectItem value="temp2">Template 2</SelectItem>
                            </SelectContent>
                        </Select>
                        <div>
                            <Button onClick={() => {
                                setStep(3)
                            }}
                                size="sm"
                                disabled={!template}>
                                Continue
                            </Button>
                            <Button
                                onClick={() => downloadCV()}
                                size="sm"
                                variant="secondary"
                                disabled={loader || !template}
                                className="ml-2">
                                {
                                    loader ?
                                        <span className="flex text-center items-center justify-center gap-1">
                                            Preparing <SpinnerLoader size="5" color="black" />
                                        </span>

                                        : "Download"
                                }
                            </Button>
                            <Button
                                size="sm"
                                className="ml-2" variant="destructive"
                                onClick={
                                    () => {
                                        setStep(1)
                                    }
                                } >
                                Back
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 3) {
        return (
            <div className="w-full border h-screen bg-gray-50">
                <NavBar />
                <div className="p-4">
                    <div className="border p-4 rounded-xl bg-white grid w-full max-w-full items-center gap-3">
                        <Textarea
                            placeholder="Type here..."
                            rows={4}
                            className="resize-none overflow-auto w-full"
                            onChange={(e) => setText(e.target.value)}
                            value={text}
                        />
                        <div className="flex">

                            <Button 
                            size="sm"
                            disabled={loader || !text} onClick={handleFinalSubmit}>
                                {
                                    loader ?
                                        <span className="flex  items-center justify-center gap-1">
                                            Updating <SpinnerLoader size="5" color="white" />
                                        </span>
                                        :
                                        "Update CV"
                                }
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
