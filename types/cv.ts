export type Project = {
    title: string;
    description: string;
    link: string;
};

export type Education = {
    degree: string;
    institute: string;
    year: string;
};

export type Experience = {
    title: string;
    company?: string;
    description: string;
};

export type CVFormData = {
    name: string;
    position: string;
    summary: string;
    links: string[];
    tech_stack: string[];
    projects: Project[];
    education: Education[];
    experience: Experience[];
};

export interface UploadCV {
    title: string;
    file: File | null;
}
