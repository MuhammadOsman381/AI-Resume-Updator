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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus, CheckCircle2 } from "lucide-react"
import Image from "next/image"

interface UploadCV {
    title: string;
    file: File | null;
}

type Project = {
    title: string
    description: string
    link: string
}

type Education = {
    degree: string
    institute: string
    year: string
}

type Experience = {
    title: string
    company?: string
    description: string
}

export type CVFormData = {
    name: string
    position: string
    summary: string
    links: string[]
    tech_stack: string[]
    projects: Project[]
    education: Education[]
    experience: Experience[]
}



export default function Home() {
    const defaultUploadCV = { title: "", file: null };
    const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null)

    const [form, setForm] = useState<CVFormData>({
        name: "",
        position: "",
        summary: "",
        links: [""],
        tech_stack: [""],
        projects: [{ title: "", description: "", link: "" }],
        education: [{ degree: "", institute: "", year: "" }],
        experience: [{ title: "", company: "", description: "" }],
    })

    const [improvedCV, setImprovedCV] = useState<CVFormData>({
        name: "",
        position: "",
        summary: "",
        links: [""],
        tech_stack: [""],
        projects: [{ title: "", description: "", link: "" }],
        education: [{ degree: "", institute: "", year: "" }],
        experience: [{ title: "", company: "", description: "" }],
    });

    const [step, setStep] = useState(1);
    const [template, setTemplate] = useState("");
    const [uploadCV, setUploadCV] = useState<UploadCV>(defaultUploadCV);
    const [cvID, setCVID] = useState("");
    const [userCVs, setUserCVs] = useState<any[]>([]);

    const [loader, setLoader] = useState<boolean>(false);
    const [improvedCVLoader, setImprovedCVLoader] = useState<boolean>(false);

    const [title, setTitle] = useState<string>("");

    const router = useRouter();

    const postCV = usePostAndPut(axios.post);
    const getUserCVsHook = useGetAndDelete(axios.get);

    const [text, setText] = useState("");

    const handleUploadSubmit = async () => {
        const formData = new FormData();
        formData.append("title", uploadCV.title);
        uploadCV.file && formData.append("file", uploadCV.file);
        const response = await postCV.callApi("upload/cv", formData, true, true, true);
        if (response && response.status === "ok") {
            setCVID(response.userCV.insertId);
            setStep(2);
            await fetchUserCVs();
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
                }
            );
            setImprovedCV(res.data.improvedCV);
            setStep(4);
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


    const updateField = <K extends keyof CVFormData>(
        field: K,
        value: CVFormData[K]
    ) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const updateArrayField = <K extends keyof CVFormData>(
        field: K,
        index: number,
        value: CVFormData[K] extends Array<infer U> ? U : never
    ) => {
        setForm((prev) => {
            const updated = [...(prev[field] as any[])]
            updated[index] = value
            return { ...prev, [field]: updated }
        })
    }

    const updateObjectArrayField = <
        K extends keyof CVFormData,
        T extends Record<string, any>,
        P extends keyof T
    >(
        field: K,
        index: number,
        key: P,
        value: T[P]
    ) => {
        setForm((prev) => {
            const updated = [...(prev[field] as any)]
            updated[index] = {
                ...updated[index],
                [key]: value,
            }
            return { ...prev, [field]: updated }
        })
    }


    const addItem = <K extends keyof CVFormData>(
        field: K,
        emptyItem: CVFormData[K] extends Array<infer U> ? U : never
    ) => {
        setForm((prev) => ({
            ...prev,
            [field]: [...(prev[field] as any[]), emptyItem],
        }))
    }

    const removeItem = <K extends keyof CVFormData>(
        field: K,
        index: number
    ) => {
        setForm((prev) => ({
            ...prev,
            [field]: (prev[field] as any[]).filter((_, i) => i !== index),
        }))
    }

    const handleSubmit = () => {
        postCV.callApi(`form/cv`, { title, json: form }, true, false, true)
            .then(async (response) => {
                if (response && response.status === "ok") {
                    setCVID(response.userCV.insertId);
                    setStep(2);
                    await fetchUserCVs();
                }
            }).catch((error) => {
                console.error("Error submitting form:", error);
            });
    }

    const handleStringCVSubmit = async () => {
        postCV.callApi(`string/cv`, { title, cvString: text }, true, false, true)
            .then(async (response) => {
                if (response && response.status === "ok") {
                    setCVID(response.userCV.insertId);
                    setStep(2);
                    await fetchUserCVs();
                }
            }).catch((error) => {
                console.error("Error submitting text CV:", error);
            });
    }

    const downloadImprovedCV = async () => {
        try {
            setImprovedCVLoader(true);
            const res = await axios.post(
                `/api/user/download/improved-cv`,
                {
                    cvData: improvedCV,
                    template,
                    title: title || "cv"
                },
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
            a.download = `${title || "cv"}-${template}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            setImprovedCVLoader(false);
        } catch (error) {
            console.error("PDF download failed", error);
            setImprovedCVLoader(false);
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
                <div className="w-full h-full flex flex-col ">
                    <div className="flex flex-1 overflow-hidden">
                        <AppSidebar fetchUserCVs={fetchUserCVs} userCVs={userCVs} cvID={cvID} setCVID={setCVID} setStep={setStep} loading={getUserCVsHook.loading} />

                        <SidebarInset>
                            <NavBar loginPage={false} showSideBarTrigger={true} />
                            <Tabs defaultValue="cv" className="p-4 w-full bg-gray-50">
                                <TabsList className="w-full" >
                                    <TabsTrigger value="cv">Upload CV</TabsTrigger>
                                    <TabsTrigger value="form">Build CV (Form)</TabsTrigger>
                                    <TabsTrigger value="string">Build CV (Text)</TabsTrigger>

                                </TabsList>

                                <TabsContent value="cv" className="" >
                                    <div className="flex flex-1 flex-col  gap-4  overflow-auto">
                                        <div className="w-full h-full  ">
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
                                </TabsContent>

                                <TabsContent value="form" className="w-full h-full overflow-scroll">
                                    <div className="w-full mx-auto overflow-scroll space-y-3">

                                        <Card className="shadow-none">
                                            <CardContent className="space-y-4">
                                                <div>
                                                    <Label>Title</Label>
                                                    <Input
                                                        value={title}
                                                        onChange={(e) => setTitle(e.target.value)}
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>


                                        {/* Basic Info */}
                                        <Card className="shadow-none" >
                                            <CardHeader>
                                                <CardTitle>Basic Information</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div>
                                                    <Label>Name</Label>
                                                    <Input
                                                        value={form.name}
                                                        onChange={(e) => updateField("name", e.target.value)}
                                                    />
                                                </div>

                                                <div>
                                                    <Label>Position</Label>
                                                    <Input
                                                        value={form.position}
                                                        onChange={(e) => updateField("position", e.target.value)}
                                                    />
                                                </div>

                                                <div>
                                                    <Label>Summary</Label>
                                                    <Textarea
                                                        value={form.summary}
                                                        onChange={(e) => updateField("summary", e.target.value)}
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Links */}
                                        <Card className="shadow-none" >
                                            <CardHeader>
                                                <CardTitle>Links</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {form.links.map((link, i) => (
                                                    <div key={i} className="flex gap-2">
                                                        <Input
                                                            placeholder="https://..."
                                                            value={link}
                                                            onChange={(e) =>
                                                                updateArrayField("links", i, e.target.value)
                                                            }
                                                        />
                                                        {form.links.length > 1 && (
                                                            <Button
                                                                size="icon"
                                                                variant="destructive"
                                                                onClick={() => removeItem("links", i)}
                                                            >
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => addItem("links", "")}
                                                >
                                                    <Plus size={16} /> Add Link
                                                </Button>
                                            </CardContent>
                                        </Card>

                                        {/* Tech Stack */}
                                        <Card className="shadow-none" >
                                            <CardHeader>
                                                <CardTitle>Tech Stack</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {form.tech_stack.map((tech, i) => (
                                                    <div key={i} className="flex gap-2">
                                                        <Input
                                                            placeholder="React, Node, Python..."
                                                            value={tech}
                                                            onChange={(e) =>
                                                                updateArrayField("tech_stack", i, e.target.value)
                                                            }
                                                        />
                                                        {form.tech_stack.length > 1 && (
                                                            <Button
                                                                size="icon"
                                                                variant="destructive"
                                                                onClick={() => removeItem("tech_stack", i)}
                                                            >
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => addItem("tech_stack", "")}
                                                >
                                                    <Plus size={16} /> Add Skill
                                                </Button>
                                            </CardContent>
                                        </Card>

                                        {/* Projects */}
                                        <Card className="shadow-none" >
                                            <CardHeader>
                                                <CardTitle>Projects</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                {form.projects.map((project, i) => (
                                                    <div key={i} className="border p-4 rounded-lg space-y-3">
                                                        <Input
                                                            placeholder="Project Title"
                                                            value={project.title}
                                                            onChange={(e) =>
                                                                updateObjectArrayField("projects", i, "title", e.target.value)
                                                            }
                                                        />
                                                        <Textarea
                                                            placeholder="Description"
                                                            value={project.description}
                                                            onChange={(e) =>
                                                                updateObjectArrayField("projects", i, "description", e.target.value)
                                                            }
                                                        />
                                                        <Input
                                                            placeholder="Project Link"
                                                            value={project.link}
                                                            onChange={(e) =>
                                                                updateObjectArrayField("projects", i, "link", e.target.value)
                                                            }
                                                        />

                                                        {form.projects.length > 1 && (
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => removeItem("projects", i)}
                                                            >
                                                                <Trash2 size={16} /> Remove Project
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}

                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        addItem("projects", { title: "", description: "", link: "" })
                                                    }
                                                >
                                                    <Plus size={16} /> Add Project
                                                </Button>
                                            </CardContent>
                                        </Card>

                                        {/* Education */}
                                        <Card className="shadow-none">
                                            <CardHeader>
                                                <CardTitle>Education</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                {form.education.map((edu, i) => (
                                                    <div key={i} className="border p-4 rounded-lg space-y-3">
                                                        <Input
                                                            placeholder="Degree"
                                                            value={edu.degree}
                                                            onChange={(e) =>
                                                                updateObjectArrayField("education", i, "degree", e.target.value)
                                                            }
                                                        />
                                                        <Input
                                                            placeholder="Institute"
                                                            value={edu.institute}
                                                            onChange={(e) =>
                                                                updateObjectArrayField("education", i, "institute", e.target.value)
                                                            }
                                                        />
                                                        <Input
                                                            placeholder="Year"
                                                            value={edu.year}
                                                            onChange={(e) =>
                                                                updateObjectArrayField("education", i, "year", e.target.value)
                                                            }
                                                        />

                                                        {form.education.length > 1 && (
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => removeItem("education", i)}
                                                            >
                                                                <Trash2 size={16} /> Remove
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}

                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        addItem("education", { degree: "", institute: "", year: "" })
                                                    }
                                                >
                                                    <Plus size={16} /> Add Education
                                                </Button>
                                            </CardContent>
                                        </Card>

                                        {/* Experience */}
                                        <Card className="shadow-none" >
                                            <CardHeader>
                                                <CardTitle>Experience</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                {form.experience.map((exp, i) => (
                                                    <div key={i} className="border p-4 rounded-lg space-y-3">
                                                        <Input
                                                            placeholder="Title"
                                                            value={exp.title}
                                                            onChange={(e) =>
                                                                updateObjectArrayField("experience", i, "title", e.target.value)
                                                            }
                                                        />
                                                        <Input
                                                            placeholder="Company (optional)"
                                                            value={exp.company}
                                                            onChange={(e) =>
                                                                updateObjectArrayField("experience", i, "company", e.target.value)
                                                            }
                                                        />
                                                        <Textarea
                                                            placeholder="Description"
                                                            value={exp.description}
                                                            onChange={(e) =>
                                                                updateObjectArrayField("experience", i, "description", e.target.value)
                                                            }
                                                        />

                                                        {form.experience.length > 1 && (
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => removeItem("experience", i)}
                                                            >
                                                                <Trash2 size={16} /> Remove
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}

                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        addItem("experience", { title: "", company: "", description: "" })
                                                    }
                                                >
                                                    <Plus size={16} /> Add Experience
                                                </Button>
                                            </CardContent>
                                        </Card>

                                        {/* Submit */}
                                        <Button className="w-full" onClick={handleSubmit}>
                                            Save CV
                                        </Button>
                                    </div>

                                </TabsContent>

                                <TabsContent value="string" className="w-full h-full overflow-scroll">
                                    <div className="w-full mx-auto overflow-scroll space-y-3">
                                        <Card className="shadow-none">
                                            <CardContent className="space-y-2">
                                                <div className="space-y-1" >
                                                    <Label>Title</Label>
                                                    <Input
                                                        value={title}
                                                        onChange={(e) => setTitle(e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-1" >
                                                    <Label>Paste CV Text</Label>
                                                    <Textarea
                                                        rows={20}
                                                        className="resize-none overflow-auto w-full"
                                                        onChange={(e) => setText(e.target.value)}
                                                        value={text}
                                                    />
                                                </div>
                                                <div>
                                                    <Button
                                                        disabled={!title || !text || postCV.loading}
                                                        size="sm"
                                                        onClick={handleStringCVSubmit}>
                                                        {
                                                            postCV.loading ?
                                                                <span className="flex  items-center justify-center gap-1">
                                                                    Submitting <SpinnerLoader size="5" color="white" />
                                                                </span>
                                                                : "Submit CV "
                                                        }
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>

                                    </div>
                                </TabsContent>

                            </Tabs>

                        </SidebarInset>
                    </div>
                </div>
            </SidebarProvider>
        );
    }

    if (step === 2) {
        return (
            <div className="w-full border h-screen bg-gray-50">
                <NavBar loginPage={false} showSideBarTrigger={false} />
                <div className="p-4">
                    <div className="bg-white border p-4 rounded-xl grid w-full max-w-full items-center gap-3">
                        <Label>Select Template</Label>



                        <Select onValueChange={(value) => {
                            setTemplate(value)
                            setHoveredTemplate(null)
                        }
                        }>
                            <SelectTrigger className="w-[220px]">
                                <SelectValue placeholder="Choose Template" />
                            </SelectTrigger>

                            <div className="relative flex">
                                <SelectContent>
                                    <SelectItem
                                        value="temp1"
                                        onMouseEnter={() => setHoveredTemplate("temp1")}
                                        onMouseLeave={() => setHoveredTemplate(null)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Image
                                                src="/templates/temp1.png"
                                                alt="Template 1"
                                                width={40}
                                                height={55}
                                                className="rounded border"
                                            />
                                            <span>Template 1</span>
                                        </div>
                                    </SelectItem>

                                    <SelectItem
                                        value="temp2"
                                        onMouseEnter={() => setHoveredTemplate("temp2")}
                                        onMouseLeave={() => setHoveredTemplate(null)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Image
                                                src="/templates/temp2.png"
                                                alt="Template 2"
                                                width={40}
                                                height={55}
                                                className="rounded border"
                                            />
                                            <span>Template 2</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>

                                {/* 🔍 BIG PREVIEW */}
                                {hoveredTemplate && (
                                    <div className="
        absolute left-[240px] top-2
        w-[360px]
        border rounded-lg bg-white shadow-lg
        p-2
        z-50
      ">
                                        <Image
                                            src={`/templates/${hoveredTemplate}.png`}
                                            alt="Template Preview"
                                            width={360}
                                            height={360}
                                            className="rounded"
                                        />
                                    </div>
                                )}
                            </div>
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
                <NavBar loginPage={false} showSideBarTrigger={false} />
                <div className="p-4">
                    <div className="border p-4 rounded-xl bg-white grid w-full max-w-full items-center gap-3">
                        <Textarea
                            placeholder="Type here..."
                            rows={4}
                            className="resize-none overflow-auto w-full"
                            onChange={(e) => setText(e.target.value)}
                            value={text}
                        />
                        <div className="flex gap-2">

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
                            <Button variant="destructive" size="sm" onClick={
                                () => {
                                    setStep(2)
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

    if (step === 4) {
        return (
            <div className="w-full border h-screen bg-gray-50">
                <NavBar loginPage={false} showSideBarTrigger={false} />
                <div className="p-4 overflow-auto">
                    <div className="border p-4 rounded-xl bg-white grid w-full max-w-full gap-4">

                        <h2 className="text-xl font-semibold mb-2 text-center">CV Preview & Edit</h2>

                        {/* Basic Info */}
                        <Card className="shadow-none">
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Name</Label>
                                    <Input
                                        value={improvedCV.name}
                                        onChange={(e) => setImprovedCV(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>Position</Label>
                                    <Input
                                        value={improvedCV.position}
                                        onChange={(e) => setImprovedCV(prev => ({ ...prev, position: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>Summary</Label>
                                    <Textarea
                                        value={improvedCV.summary}
                                        onChange={(e) => setImprovedCV(prev => ({ ...prev, summary: e.target.value }))}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Links */}
                        <Card className="shadow-none">
                            <CardHeader>
                                <CardTitle>Links</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {improvedCV.links.map((link, i) => (
                                    <div key={i} className="flex gap-2">
                                        <Input
                                            placeholder="https://..."
                                            value={link}
                                            onChange={(e) => {
                                                const updated = [...improvedCV.links];
                                                updated[i] = e.target.value;
                                                setImprovedCV(prev => ({ ...prev, links: updated }));
                                            }}
                                        />
                                        {improvedCV.links.length > 1 && (
                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                onClick={() => {
                                                    const updated = improvedCV.links.filter((_, idx) => idx !== i);
                                                    setImprovedCV(prev => ({ ...prev, links: updated }));
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setImprovedCV(prev => ({ ...prev, links: [...prev.links, ""] }))}
                                >
                                    <Plus size={16} /> Add Link
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Projects */}
                        <Card className="shadow-none">
                            <CardHeader>
                                <CardTitle>Projects</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {improvedCV.projects.map((project, i) => (
                                    <div key={i} className="border p-4 rounded-lg space-y-2">
                                        <Input
                                            placeholder="Project Title"
                                            value={project.title}
                                            onChange={(e) => {
                                                const updated = [...improvedCV.projects];
                                                updated[i].title = e.target.value;
                                                setImprovedCV(prev => ({ ...prev, projects: updated }));
                                            }}
                                        />
                                        <Textarea
                                            placeholder="Description"
                                            value={project.description}
                                            onChange={(e) => {
                                                const updated = [...improvedCV.projects];
                                                updated[i].description = e.target.value;
                                                setImprovedCV(prev => ({ ...prev, projects: updated }));
                                            }}
                                        />
                                        <Input
                                            placeholder="Project Link"
                                            value={project.link}
                                            onChange={(e) => {
                                                const updated = [...improvedCV.projects];
                                                updated[i].link = e.target.value;
                                                setImprovedCV(prev => ({ ...prev, projects: updated }));
                                            }}
                                        />
                                        {improvedCV.projects.length > 1 && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => {
                                                    const updated = improvedCV.projects.filter((_, idx) => idx !== i);
                                                    setImprovedCV(prev => ({ ...prev, projects: updated }));
                                                }}
                                            >
                                                <Trash2 size={16} /> Remove Project
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setImprovedCV(prev => ({
                                        ...prev,
                                        projects: [...prev.projects, { title: "", description: "", link: "" }]
                                    }))}
                                >
                                    <Plus size={16} /> Add Project
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Education */}
                        <Card className="shadow-none">
                            <CardHeader>
                                <CardTitle>Education</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {improvedCV.education.map((edu, i) => (
                                    <div key={i} className="border p-4 rounded-lg space-y-2">
                                        <Input
                                            placeholder="Degree"
                                            value={edu.degree}
                                            onChange={(e) => {
                                                const updated = [...improvedCV.education];
                                                updated[i].degree = e.target.value;
                                                setImprovedCV(prev => ({ ...prev, education: updated }));
                                            }}
                                        />
                                        <Input
                                            placeholder="Institute"
                                            value={edu.institute}
                                            onChange={(e) => {
                                                const updated = [...improvedCV.education];
                                                updated[i].institute = e.target.value;
                                                setImprovedCV(prev => ({ ...prev, education: updated }));
                                            }}
                                        />
                                        <Input
                                            placeholder="Year"
                                            value={edu.year}
                                            onChange={(e) => {
                                                const updated = [...improvedCV.education];
                                                updated[i].year = e.target.value;
                                                setImprovedCV(prev => ({ ...prev, education: updated }));
                                            }}
                                        />
                                        {improvedCV.education.length > 1 && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => {
                                                    const updated = improvedCV.education.filter((_, idx) => idx !== i);
                                                    setImprovedCV(prev => ({ ...prev, education: updated }));
                                                }}
                                            >
                                                <Trash2 size={16} /> Remove
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setImprovedCV(prev => ({
                                        ...prev,
                                        education: [...prev.education, { degree: "", institute: "", year: "" }]
                                    }))}
                                >
                                    <Plus size={16} /> Add Education
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Experience */}
                        <Card className="shadow-none">
                            <CardHeader>
                                <CardTitle>Experience</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {improvedCV.experience.map((exp, i) => (
                                    <div key={i} className="border p-4 rounded-lg space-y-2">
                                        <Input
                                            placeholder="Title"
                                            value={exp.title}
                                            onChange={(e) => {
                                                const updated = [...improvedCV.experience];
                                                updated[i].title = e.target.value;
                                                setImprovedCV(prev => ({ ...prev, experience: updated }));
                                            }}
                                        />
                                        <Input
                                            placeholder="Company (optional)"
                                            value={exp.company}
                                            onChange={(e) => {
                                                const updated = [...improvedCV.experience];
                                                updated[i].company = e.target.value;
                                                setImprovedCV(prev => ({ ...prev, experience: updated }));
                                            }}
                                        />
                                        <Textarea
                                            placeholder="Description"
                                            value={exp.description}
                                            onChange={(e) => {
                                                const updated = [...improvedCV.experience];
                                                updated[i].description = e.target.value;
                                                setImprovedCV(prev => ({ ...prev, experience: updated }));
                                            }}
                                        />
                                        {improvedCV.experience.length > 1 && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => {
                                                    const updated = improvedCV.experience.filter((_, idx) => idx !== i);
                                                    setImprovedCV(prev => ({ ...prev, experience: updated }));
                                                }}
                                            >
                                                <Trash2 size={16} /> Remove
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setImprovedCV(prev => ({
                                        ...prev,
                                        experience: [...prev.experience, { title: "", company: "", description: "" }]
                                    }))}
                                >
                                    <Plus size={16} /> Add Experience
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="flex justify-center gap-2">
                            <Button size="sm" variant="destructive" onClick={() => setStep(3)}>Back</Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                disabled={loader}
                                onClick={() => downloadCV()}
                            >
                                {
                                    loader ?
                                        <span className="flex  items-center justify-center gap-1">
                                            Preparing <SpinnerLoader size="5" color="black" />
                                        </span>
                                        :
                                        "Download original CV"
                                }
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => downloadImprovedCV()}
                                disabled={improvedCVLoader}
                            >
                                <>
                                    {improvedCVLoader ?
                                        <span className="flex  items-center justify-center gap-1">
                                            Preparing <SpinnerLoader size="5" color="white" />
                                        </span>
                                        :
                                        "Download Improved CV"
                                    }
                                </>
                            </Button>
                        </div>

                    </div>
                </div>
            </div>
        )
    }

}
