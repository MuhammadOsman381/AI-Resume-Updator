"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios"
import usePostAndPut from "@/hooks/usePostAndPut";
import NavBar from "@/components/NavBar";
import { AppSidebar } from "@/components/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"

interface UploadCV {
    title: string,
    file: File | null
}


export default function Home() {
    const defaultUploadCV = {
        title: "",
        file: null
    };

    const [step, setStep] = useState(1);
    const [template, setTemplate] = useState("");
    const [uploadCV, setUploadCV] = useState<UploadCV>(defaultUploadCV);

    const postCV = usePostAndPut(axios.post)
    const jobDescription = usePostAndPut(axios.post)

    const [text, setText] = useState("");

    const handleUploadSubmit = () => {
        console.log("Title:", uploadCV.title);
        console.log("File:", uploadCV.file);
        const formData = new FormData();
        formData.append("title", uploadCV.title);
        uploadCV.file && formData.append("file", uploadCV.file);
        const res = postCV.callApi("upload/cv", formData, false, true, true)
        setStep(2);
    };

    const handleFinalSubmit = () => {
        
        console.log("Text:", text);
        console.log("Selected Template:", template);
        console.log("Uploaded Data:", uploadCV);
    };

    if (step === 1) {
        return (
            <SidebarProvider>
                <div className="w-full h-screen flex flex-col bg-gray-50">
                    <div className="flex flex-1 overflow-hidden">
                        <AppSidebar />
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
                                                    if (!e.target.files) return
                                                    setUploadCV({
                                                        ...uploadCV,
                                                        file: e.target.files[0],
                                                    })
                                                }}
                                            />
                                            <div>
                                                <Button onClick={handleUploadSubmit}>
                                                    Submit CV
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
            <div className=" w-full border h-screen bg-gray-50">
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
                            <Button onClick={() => setStep(3)} disabled={!template}>
                                Continue
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
                <div className="p-4" >
                    <div className="border p-4 rounded-xl bg-white grid w-full max-w-full items-center gap-3">
                        <Textarea
                            placeholder="Type here..."
                            className="h-40"
                            onChange={(e) => setText(e.target.value)}
                        />
                        <div className="flex">
                            <Button onClick={handleFinalSubmit}>Submit</Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
