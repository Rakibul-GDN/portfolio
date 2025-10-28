import React from "react";
import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon } from "lucide-react";
import jsonData from "./data.json";

// Define proper TypeScript types based on the original structure
interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

interface SocialLink {
  name: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  navbar: boolean;
}

interface ProjectLink {
  type: string;
  href: string;
  icon: React.ReactNode;
}

interface Project {
  title: string;
  href: string;
  dates: string;
  active: boolean;
  description: string;
  technologies: string[];
  links: ProjectLink[];
  logoUrl?: string;
  image: string;
  video: string;
}

interface WorkExperience {
  company: string;
  href: string;
  badges: string[];
  location: string;
  title: string;
  logoUrl: string;
  start: string;
  end: string;
  description: string;
}

interface Education {
  school: string;
  href: string;
  degree: string;
  logoUrl: string;
  start: string;
  end: string;
  description: string;
  badges: string[];
}



interface Contact {
  email: string;
  tel: string;
  social: {
    [key: string]: SocialLink;
  };
}

interface DataStructure {
  name: string;
  initials: string;
  url: string;
  location: string;
  locationLink: string;
  description: string;
  summary: string;
  avatarUrl: string;
  skills: string[];
  navbar: NavItem[];
  contact: Contact;
  work: WorkExperience[];
  education: Education[];
  projects: Project[];
  hackathons: any[];
}

// Define icon components
const iconComponents = {
  github: Icons.github,
  linkedin: Icons.linkedin,
  email: Icons.email,
  x: Icons.x,
  youtube: Icons.youtube,
  globe: Icons.globe,
  HomeIcon: HomeIcon,
  NotebookIcon: NotebookIcon,
};

// Process the JSON data to replace icon strings with actual components
const processData = (data: any): DataStructure => {
  // Process navbar icons
  const navbar: NavItem[] = data.navbar.map((item: any) => ({
    ...item,
    icon: iconComponents[item.icon as keyof typeof iconComponents],
  }));

  // Process social icons
  const social: { [key: string]: SocialLink } = Object.keys(data.contact.social).reduce((acc, key) => {
    const socialItem = data.contact.social[key];
    acc[key as string] = {
      ...socialItem,
      icon: iconComponents[socialItem.icon as keyof typeof iconComponents],
    };
    return acc;
  }, {} as { [key: string]: SocialLink });

  // Process project links icons - create actual React elements
  const projects: Project[] = data.projects.map((project: any) => ({
    ...project,
    links: project.links.map((link: any) => ({
      ...link,
      icon: React.createElement(iconComponents[link.icon as keyof typeof iconComponents], { className: "size-3" }),
    })),
  }));

  return {
    ...data,
    navbar,
    contact: {
      ...data.contact,
      social,
    },
    projects,
  } as DataStructure;
};

const processedData = processData(jsonData);

export const DATA = processedData;