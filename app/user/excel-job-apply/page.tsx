"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SpinnerLoader from "@/components/SpinnerLoader";
import usePostAndPut from "@/hooks/usePostAndPut";
import useGetAndDelete from "@/hooks/useGetAndDelete";
import axios from "axios";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";


interface Jobs {
  id: string;
  title: string;
  description: string;
  emails: string[];
  status: string;
}

interface CV {
  id: string;
  title: string;
}

const Page = () => {
  const [jobs, setJobs] = useState<Jobs[]>([]);
  const [userCVs, setUserCVs] = useState<CV[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("temp1");
  const [selectedCV, setSelectedCV] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emails, setEmails] = useState([""]);


  const userJob = useGetAndDelete(axios.get);
  const getUserCVsHook = useGetAndDelete(axios.get);
  const applyJobHook = usePostAndPut(axios.post);
  const deleteJobHook = useGetAndDelete(axios.delete);
  const applyToAllJobsHook = usePostAndPut(axios.post);
  const createJobHook = usePostAndPut(axios.post);


  const handleEmailChange = (index: number, value: string) => {
    const updated = [...emails];
    updated[index] = value;
    setEmails(updated);
  };

  function normalizeText(text: string) {
    return text
      .normalize('NFKC')
      .replace(/[\p{Extended_Pictographic}\uFE0F]/gu, '') // remove emojis
      .replace(/[’‘]/g, "'")                              // normalize quotes
      .replace(/[“”]/g, '"')
      .replace(/\s+/g, ' ')                               // normalize spaces
      .trim();
  }


  const addEmailField = () => {
    setEmails([...emails, ""]);
  };

  const removeEmailField = (index: number) => {
    const updated = emails.filter((_, i) => i !== index);
    setEmails(updated);
  };

  const handleSave = () => {
    const payload = {
      title,
      description,
      emails: emails.filter((e) => e.trim() !== ""),
    }

    createJobHook.callApi("jobs/create", payload, true, false, true).then(async () => {
      setTitle("");
      setDescription("");
      setEmails([""]);
      await getUserJobs();
    }).catch((err) => {
      console.error(err);
      toast.error("Failed to create job");
    });

  };

  // Fetch user jobs
  const getUserJobs = async () => {
    const res = await userJob.callApi("jobs/get", true, false);
    console.log("User jobs:", res.jobs);
    setJobs(res.jobs);
  };

  // Fetch user CVs
  const fetchUserCVs = async () => {
    const res = await getUserCVsHook.callApi("user/cv", true, false);
    if (res && res.status === "ok") {
      setUserCVs(res.data);
      if (res.data.length > 0) setSelectedCV(res.data[0].id);
    } else {
      setUserCVs([]);
    }
  };

  useEffect(() => {
    getUserJobs();
    fetchUserCVs();
  }, []);

  return (
    <div className="p-4 w-full">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="details">Add Job Details</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
        </TabsList>



        {/* JOB DETAILS TAB */}
        <TabsContent value="details">


          <div className=" mx-auto space-y-6 p-6 bg-white rounded-xl border">

            <div className="space-y-1">
              <Label htmlFor="job-title">Job Title</Label>
              <Input
                id="job-title"
                value={normalizeText(title)}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter job title"
              />
            </div>

            {/* Job Description */}
            <div className="space-y-1">
              <Label htmlFor="job-description">Job Description</Label>
              <Textarea
                id="job-description"
                value={normalizeText(description)}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter job description"
                rows={4}
              />
            </div>

            {/* Emails */}
            <div className="space-y-2">
              <Label>Emails</Label>
              {emails.map((email, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    type="email"
                    value={normalizeText(email)}
                    onChange={(e) => handleEmailChange(idx, e.target.value)}
                    placeholder="Enter email"
                  />
                  {emails.length > 1 && (
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeEmailField(idx)}
                    >
                      <X size={16} />
                    </Button>
                  )}
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={addEmailField}>
                Add More
              </Button>
            </div>

            {/* Save Button */}
            <div>
              <Button onClick={handleSave}>Save Job Details</Button>
            </div>
          </div>

        </TabsContent>

        {/* JOBS TAB */}
        <TabsContent value="jobs">
          {userJob.loading ? (
            <SpinnerLoader size="10" color="black" />
          ) : jobs.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">No jobs found.</div>
          ) : (
            <>

              <div className="flex items-center justify-between bg-white px-4 py-3 flex-wrap rounded-xl border mb-2 gap-3">

                <div className="flex gap-2" >
                  <div>
                    <label className="block text-sm font-medium mb-1">Template</label>
                    <DropdownMenu

                    >
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="w-32 text-left">
                          {selectedTemplate}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setSelectedTemplate("temp1")}>
                          temp1
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedTemplate("temp2")}>
                          temp2
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Select CV</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="w-48 text-left">
                          {userCVs.find((cv) => cv.id === selectedCV)?.title || "Select CV"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {userCVs.map((cv) => (
                          <DropdownMenuItem key={cv.id} onClick={() => setSelectedCV(cv.id)}>
                            {cv.title}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <Button
                  onClick={
                    async () => {
                      await applyToAllJobsHook.callApi("jobs/apply-all", {
                        cvId: selectedCV,
                        template: selectedTemplate,
                      }, true, false, true)

                      await getUserJobs();
                    }
                  }
                  disabled={applyToAllJobsHook.loading}
                >
                  {
                    applyToAllJobsHook.loading ? (
                      <div className="flex items-center justify-center gap-1.5">
                        Applying to all Jobs <SpinnerLoader size="5" color="white" />
                      </div>
                    ) : "Apply to all Jobs"
                  }

                </Button>

              </div>


              {/* JOB CARDS */}
              <div className="flex flex-col gap-4">
                {jobs.map((job) => (
                  <Card key={job.id} className="shadow-none">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">{job.title}</CardTitle>
                      <CardDescription
                        className={`text-sm ${job.status.toLowerCase() === "applied"
                          ? "text-green-600"
                          : job.status.toLowerCase() === "pending"
                            ? "text-red-600"
                            : "text-gray-500"
                          }`}
                      >
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}

                      </CardDescription>
                    </CardHeader>

                    <CardContent className="text-gray-700">
                      {job.description
                        .split("•")
                        .map((line, idx) => {
                          const trimmed = line.trim();
                          if (!trimmed) return null;
                          return (
                            <div key={idx} className="mb-2 flex flex-col">
                              {trimmed}
                            </div>
                          );
                        })}
                    </CardContent>

                    {job.emails.length > 0 && (
                      <CardContent className="text-sm text-gray-600">
                        <span className="font-semibold">Emails:</span>
                        <div className="mt-1">
                          {job.emails.map((email, idx) => (
                            <div key={idx}>{email}</div>
                          ))}
                        </div>
                      </CardContent>
                    )}

                    <CardFooter className="flex space-x-2">


                      <Button
                        size="sm"
                        onClick={async () => {
                          try {
                            const payload = {
                              id: job.id,
                              cvId: selectedCV,
                              template: selectedTemplate,
                            };

                            const res = await applyJobHook.callApi(
                              "jobs/apply-single",
                              payload,
                              true,
                              false,
                              true,
                            );

                            await getUserJobs();
                            console.log(res);
                          } catch (err) {
                            console.error(err);
                          } finally {
                          }
                        }}
                        disabled={applyJobHook.loading || applyToAllJobsHook.loading}
                      >
                        {
                          job.status.toLowerCase() === "applied" ? "Reapply" :
                            "Apply"
                        }
                      </Button>

                      <Button
                        onClick={
                          async () => {
                            await deleteJobHook.callApi(`jobs/delete/${job.id}`, true, false).then(() => getUserJobs())
                            await getUserJobs();
                          }
                        }
                        disabled={deleteJobHook.loading}
                        variant="destructive" size="sm">
                        {deleteJobHook.loading ? (
                          <div className="flex items-center justify-center gap-1.5">
                            Deleting <SpinnerLoader size="5" color="white" />
                          </div>
                        ) : (
                          "Delete"
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Page;
