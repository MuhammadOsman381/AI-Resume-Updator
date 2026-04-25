"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import usePostAndPut from "@/hooks/usePostAndPut";
import useGetAndDelete from "@/hooks/useGetAndDelete";

// Components
import { DashboardStep } from "@/components/user/DashboardStep";
import { TemplateStep } from "@/components/user/TemplateStep";
import { JobDescriptionStep } from "@/components/user/JobDescriptionStep";
import { ImproveStep } from "@/components/user/ImproveStep";
import { SelectionStep } from "@/components/user/SelectionStep";
import { AtsResultStep } from "@/components/user/AtsResultStep";
import { CoverLetterStep } from "@/components/user/CoverLetterStep";
import { useToast } from "@/hooks/use-toast";


import { CVFormData, UploadCV } from "@/types/cv";


export default function Home() {
    const { toast } = useToast();

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
    const [selectionType, setSelectionType] = useState<"ats" | "improve" | "cover-letter" | "">("");
    const [atsResult, setAtsResult] = useState<any>(null);

    const [coverLetter, setCoverLetter] = useState<string>("");
    const [coverLetterLoader, setCoverLetterLoader] = useState<boolean>(false);
    const [coverLetterCompany, setCoverLetterCompany] = useState<string>("");

    const router = useRouter();

    const postCV = usePostAndPut(axios.post);
    const getUserCVsHook = useGetAndDelete(axios.get);

    const [text, setText] = useState("");

    const handleUploadSubmit = async () => {
        const formData = new FormData();
        formData.append("title", uploadCV.title);
        uploadCV.file && formData.append("file", uploadCV.file);
        await postCV.callApi("upload/cv", formData, true, true, true);
        await fetchUserCVs();
    };

    const handleFinalSubmit = async () => {
        const payload = {
            cvID: cvID,
            jobDescription: text,
            template: template,
        };
        setLoader(true);
        try {
            if (selectionType === "improve") {
                const res = await axios.post(
                    `/api/user/update-cv`,
                    payload,
                    {
                        headers: {
                            authorization: localStorage.getItem("authorization") || "",
                        },
                    }
                );
                if (res.data.status === "ok") {
                    setImprovedCV(res.data.improvedCV);
                    setStep(4);
                } else {
                    throw new Error(res.data.message || "Failed to improve CV");
                }
            } else {
                const res = await axios.post(
                    `/api/user/ats-score`,
                    { cvID, jobDescription: text },
                    {
                        headers: {
                            authorization: localStorage.getItem("authorization") || "",
                        },
                    }
                );
                if (res.data.status === "ok") {
                    setAtsResult(res.data.atsResult);
                    setStep(6);
                } else {
                    throw new Error(res.data.message || "Failed to calculate ATS score");
                }
            }
        } catch (error: any) {
            console.error("Operation failed", error);
            toast({
                title: "Operation Failed",
                description: error.response?.data?.message || error.message || "Something went wrong. Please try again.",
                variant: "destructive",
            });
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
                console.log("Form CV submitted, ID:", response);
            }).catch((error) => {
                console.error("Error submitting form:", error);
            })
            .finally(async () => {
                await fetchUserCVs();
            })
    }

    const handleStringCVSubmit = async () => {
        postCV.callApi(`string/cv`, { title, cvString: text }, true, false, true)
            .then(async (response) => {
                console.log("Text CV submitted, ID:", response);
            }).catch((error) => {
                console.error("Error submitting text CV:", error);
            })
            .finally(async () => {
                await fetchUserCVs();
            })
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

    const handleGenerateCoverLetter = async (jobTitle: string, companyName: string, jobDescription: string) => {
        setCoverLetterLoader(true);
        setCoverLetterCompany(companyName);
        try {
            const res = await axios.post(
                `/api/user/generate-cover-letter`,
                { cvID, jobTitle, companyName, jobDescription },
                {
                    headers: {
                        authorization: localStorage.getItem("authorization") || "",
                    },
                }
            );
            if (res.data.status === "ok") {
                setCoverLetter(res.data.coverLetter);
            } else {
                throw new Error(res.data.message || "Failed to generate cover letter");
            }
        } catch (error: any) {
            console.error("Cover letter generation failed", error);
            toast({
                title: "Generation Failed",
                description: error.response?.data?.message || error.message || "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setCoverLetterLoader(false);
        }
    };

    const downloadCoverLetterPDF = async () => {
        try {
            setCoverLetterLoader(true);
            const res = await axios.post(
                `/api/user/download/cover-letter`,
                {
                    cvID,
                    coverLetter,
                    companyName: coverLetterCompany
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
            a.download = `cover-letter-${coverLetterCompany}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("PDF download failed", error);
        } finally {
            setCoverLetterLoader(false);
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

    // Render based on step
    switch (step) {
        case 1:
            return (
                <DashboardStep
                    fetchUserCVs={fetchUserCVs}
                    userCVs={userCVs}
                    cvID={cvID}
                    setCVID={setCVID}
                    setStep={setStep}
                    loading={getUserCVsHook.loading}
                    uploadCV={uploadCV}
                    setUploadCV={setUploadCV}
                    handleUploadSubmit={handleUploadSubmit}
                    postCVLoading={postCV.loading}
                    title={title}
                    setTitle={setTitle}
                    form={form}
                    updateField={updateField}
                    updateArrayField={updateArrayField}
                    updateObjectArrayField={updateObjectArrayField}
                    addItem={addItem}
                    removeItem={removeItem}
                    handleSubmit={handleSubmit}
                    text={text}
                    setText={setText}
                    handleStringCVSubmit={handleStringCVSubmit}
                />
            );
        case 2:
            return (
                <TemplateStep
                    template={template}
                    setTemplate={setTemplate}
                    setStep={setStep}
                    hoveredTemplate={hoveredTemplate}
                    setHoveredTemplate={setHoveredTemplate}
                    downloadCV={downloadCV}
                    loader={loader}
                />
            );
        case 3:
            return (
                <JobDescriptionStep
                    selectionType={selectionType}
                    text={text}
                    setText={setText}
                    loader={loader}
                    handleFinalSubmit={handleFinalSubmit}
                    setStep={setStep}
                />
            );
        case 4:
            return (
                <ImproveStep
                    improvedCV={improvedCV}
                    setImprovedCV={setImprovedCV}
                    setStep={setStep}
                    loader={loader}
                    improvedCVLoader={improvedCVLoader}
                    downloadCV={downloadCV}
                    downloadImprovedCV={downloadImprovedCV}
                />
            );
        case 5:
            return (
                <SelectionStep
                    setSelectionType={setSelectionType}
                    setStep={setStep}
                />
            );
        case 6:
            return (
                <AtsResultStep
                    atsResult={atsResult}
                    setSelectionType={setSelectionType}
                    setStep={setStep}
                />
            );
        case 7:
            return (
                <CoverLetterStep
                    handleGenerate={handleGenerateCoverLetter}
                    coverLetter={coverLetter}
                    loading={coverLetterLoader}
                    setStep={setStep}
                    downloadPDF={downloadCoverLetterPDF}
                />
            );
        default:
            return null;
    }
}
