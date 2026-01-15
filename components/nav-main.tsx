"use client"

import { useState } from "react"
import { Key, MoreHorizontal, type LucideIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import usePostAndPut from "@/hooks/usePostAndPut"
import axios from "axios"
import SpinnerLoader from "./SpinnerLoader"
import useGetAndDelete from "@/hooks/useGetAndDelete"

export function NavMain({
  items,
  setCVID,
  setStep,
  fetchUserCVs
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items: {
      title: string
      url: string
      id: string
      cvJson?: any
    }[]
  }[]
  setCVID: React.Dispatch<React.SetStateAction<string>>
  setStep: React.Dispatch<React.SetStateAction<number>>
  fetchUserCVs: () => void
}) {
  const { isMobile } = useSidebar()

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [id, setId] = useState<string>("")

  const edit = usePostAndPut(axios.put)
  const deleteCV = useGetAndDelete(axios.delete)

  // form state
  const [form, setForm] = useState<any>({
    name: "",
    position: "",
    links: [""],
    summary: "",
    tech_stack: [""],
    projects: [{ title: "", description: "", link: "" }],
    education: [{ degree: "", institute: "", year: "" }],
    experience: [{ title: "", company: "", description: "" }],
  })

  const updateField = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }))
  }

  const updateArrayField = (field: string, index: number, value: any) => {
    setForm((prev: any) => {
      const updated = [...prev[field]]
      updated[index] = value
      return { ...prev, [field]: updated }
    })
  }

  const updateObjectArrayField = (
    field: string,
    index: number,
    key: string,
    value: any
  ) => {
    setForm((prev: any) => {
      const updated = [...prev[field]]
      updated[index] = { ...updated[index], [key]: value }
      return { ...prev, [field]: updated }
    })
  }

  const addItem = (field: string, emptyItem: any) => {
    setForm((prev: any) => ({ ...prev, [field]: [...prev[field], emptyItem] }))
  }

  const removeItem = (field: string, index: number) => {
    setForm((prev: any) => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index),
    }))
  }

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem
            key={item.title}
            className="flex items-center justify-between"
          >
            <SidebarMenuButton
              className="flex-1 text-left"
              onClick={() => {
                setCVID(item.items?.[0]?.id)
                setStep(2)
              }}
            >
              {item.title}
            </SidebarMenuButton>

            {item.items?.length ? (
              <DropdownMenu
              >
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-2 hover:bg-gray-100 rounded"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                  className="min-w-56 rounded-lg"
                >
                  {item.items.map((sub) => (
                    <div
                      key={sub.id}
                    >
                      <DropdownMenuItem
                        key={sub.id}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          const cv = sub.cvJson
                          if (!cv) return
                          setForm({
                            name: cv.name || "",
                            position: cv.position || "",
                            links: cv.links?.length ? cv.links : [""],
                            summary: cv.summary || "",
                            tech_stack: cv.tech_stack?.length ? cv.tech_stack : [""],
                            projects:
                              cv.projects?.length > 0
                                ? cv.projects
                                : [{ title: "", description: "", link: "" }],
                            education:
                              cv.education?.length > 0
                                ? cv.education
                                : [{ degree: "", institute: "", year: "" }],
                            experience:
                              cv.experience?.length > 0
                                ? cv.experience
                                : [{ title: "", company: "", description: "" }],
                          })
                          setId(sub.id)
                          setEditDialogOpen(true)
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          deleteCV.callApi(`delete/cv/${sub.id}`, true, false)
                            .then(async (res) => {
                              console.log(res)
                              await fetchUserCVs()
                            })
                            .catch((err) => {
                              console.error(err)
                            })
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Edit CV</DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex flex-col gap-6 h-full w-full p-4">
            <div className="flex flex-col gap-3">
              <Input
                placeholder="Name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
              <Input
                placeholder="Position"
                value={form.position}
                onChange={(e) => updateField("position", e.target.value)}
              />
              <Textarea
                placeholder="Summary"
                value={form.summary}
                onChange={(e) => updateField("summary", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-3 mt-2">
              <h4 className="font-medium">Links</h4>
              {form.links.map((link: string, i: number) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder="https://..."
                    value={link}
                    onChange={(e) => updateArrayField("links", i, e.target.value)}
                  />
                  {form.links.length > 1 && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeItem("links", i)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button size="sm" variant="secondary" onClick={() => addItem("links", "")}>
                Add Link
              </Button>
            </div>

            {/* Tech Stack */}
            <div className="flex flex-col gap-3 mt-2">
              <h4 className="font-medium">Tech Stack</h4>
              {form.tech_stack.map((tech: string, i: number) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder="React, Node..."
                    value={tech}
                    onChange={(e) => updateArrayField("tech_stack", i, e.target.value)}
                  />
                  {form.tech_stack.length > 1 && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeItem("tech_stack", i)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => addItem("tech_stack", "")}
              >
                Add Skill
              </Button>
            </div>

            {/* Projects */}
            <div className="flex flex-col gap-3 mt-2">
              <h4 className="font-medium">Projects</h4>
              {form.projects.map((p: any, i: number) => (
                <div key={i} className="border p-3 rounded-lg flex flex-col gap-2">
                  <Input
                    placeholder="Title"
                    value={p.title}
                    onChange={(e) =>
                      updateObjectArrayField("projects", i, "title", e.target.value)
                    }
                  />
                  <Textarea
                    placeholder="Description"
                    value={p.description}
                    onChange={(e) =>
                      updateObjectArrayField("projects", i, "description", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Link"
                    value={p.link}
                    onChange={(e) =>
                      updateObjectArrayField("projects", i, "link", e.target.value)
                    }
                  />
                  {form.projects.length > 1 && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeItem("projects", i)}
                    >
                      Remove Project
                    </Button>
                  )}
                </div>
              ))}
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  addItem("projects", { title: "", description: "", link: "" })
                }
              >
                Add Project
              </Button>
            </div>

            {/* Education */}
            <div className="flex flex-col gap-3 mt-2">
              <h4 className="font-medium">Education</h4>
              {form.education.map((e: any, i: number) => (
                <div key={i} className="border p-3 rounded-lg flex flex-col gap-2">
                  <Input
                    placeholder="Degree"
                    value={e.degree}
                    onChange={(ev) =>
                      updateObjectArrayField("education", i, "degree", ev.target.value)
                    }
                  />
                  <Input
                    placeholder="Institute"
                    value={e.institute}
                    onChange={(ev) =>
                      updateObjectArrayField("education", i, "institute", ev.target.value)
                    }
                  />
                  <Input
                    placeholder="Year"
                    value={e.year}
                    onChange={(ev) =>
                      updateObjectArrayField("education", i, "year", ev.target.value)
                    }
                  />
                  {form.education.length > 1 && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeItem("education", i)}
                    >
                      Remove Education
                    </Button>
                  )}
                </div>
              ))}
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  addItem("education", { degree: "", institute: "", year: "" })
                }
              >
                Add Education
              </Button>
            </div>

            {/* Experience */}
            <div className="flex flex-col gap-3 mt-2">
              <h4 className="font-medium">Experience</h4>
              {form.experience.map((exp: any, i: number) => (
                <div key={i} className="border p-3 rounded flex flex-col gap-2">
                  <Input
                    placeholder="Title"
                    value={exp.title}
                    onChange={(ev) =>
                      updateObjectArrayField("experience", i, "title", ev.target.value)
                    }
                  />
                  <Input
                    placeholder="Company"
                    value={exp.company || ""}
                    onChange={(ev) =>
                      updateObjectArrayField("experience", i, "company", ev.target.value)
                    }
                  />
                  <Textarea
                    placeholder="Description"
                    value={exp.description}
                    onChange={(ev) =>
                      updateObjectArrayField("experience", i, "description", ev.target.value)
                    }
                  />
                  {form.experience.length > 1 && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeItem("experience", i)}
                    >
                      Remove Experience
                    </Button>
                  )}
                </div>
              ))}
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  addItem("experience", { title: "", company: "", description: "" })
                }
              >
                Add Experience
              </Button>
            </div>

            <Button className="w-full mt-3"
              onClick={
                () => {
                  edit.callApi("edit/cv", {
                    id: id,
                    json: form
                  }, true, false, true).then(() => {
                    setEditDialogOpen(false)
                  })
                    .catch((err) => {
                      console.error(err)
                    })
                }
              }
              disabled={edit.loading}
            >
              {
                edit.loading ?
                  <div className="flex items-center justify-center text-center gap-1.5" >
                    Please wait
                    <SpinnerLoader size="2" color="black" />
                  </div> :
                  "Save Changes"
              }
            </Button>
          </ScrollArea>
        </DialogContent>
      </Dialog>

    </SidebarGroup>
  )
}
