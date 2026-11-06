import { Briefcase, Compass, FolderOpen, GitBranch, Mail, Settings, SquareTerminal, UserRound, type LucideIcon } from "lucide-react";
import type { ComponentType } from "react";
import { profile } from "@/content/profile";
import { AboutApp } from "./apps/about-app";
import { BlogApp } from "./apps/blog-app";
import { MailApp } from "./apps/mail-app";
import { ProjectsApp } from "./apps/projects-app";
import { SettingsApp } from "./apps/settings-app";
import { TerminalApp } from "./apps/terminal-app";
import type { AppId } from "./os-context";

export type AppDef = {
  id: AppId;
  title: string;
  icon: LucideIcon;
  from: string;
  to: string;
  size: { w: number; h: number };
  component: ComponentType<{ props?: Record<string, string> }>;
  keywords: string;
};

export const apps: AppDef[] = [
  { id: "about", title: "About Me", icon: UserRound, from: "#ff8a65", to: "#f4511e", size: { w: 860, h: 580 }, component: AboutApp, keywords: "about bio experience skills work timeline how i work" },
  { id: "projects", title: "Projects", icon: FolderOpen, from: "#6cb8ff", to: "#2f7bf6", size: { w: 880, h: 560 }, component: ProjectsApp, keywords: "projects portfolio work apps finder" },
  { id: "terminal", title: "Terminal — Ask my AI", icon: SquareTerminal, from: "#3f3f46", to: "#09090b", size: { w: 760, h: 480 }, component: TerminalApp, keywords: "terminal ai chat ask question shell" },
  { id: "blog", title: "Blog", icon: Compass, from: "#7dd3fc", to: "#0284c7", size: { w: 1000, h: 660 }, component: BlogApp, keywords: "blog posts writing notes articles knowledge claude ai tokens dotnet seo pwa cicd" },
  { id: "mail", title: "Contact", icon: Mail, from: "#5eead4", to: "#0d9488", size: { w: 640, h: 520 }, component: MailApp, keywords: "contact email mail hire message" },
  { id: "settings", title: "Settings", icon: Settings, from: "#a1a1aa", to: "#52525b", size: { w: 620, h: 460 }, component: SettingsApp, keywords: "settings wallpaper dark mode theme appearance" },
];

export const externalLinks: { id: string; title: string; href: string; icon: LucideIcon; from: string; to: string }[] = [
  { id: "github", title: "GitHub", href: profile.github, icon: GitBranch, from: "#52525b", to: "#18181b" },
  { id: "linkedin", title: "LinkedIn", href: profile.linkedin, icon: Briefcase, from: "#60a5fa", to: "#1d4ed8" },
];

export const appById = (id: AppId) => apps.find((a) => a.id === id)!;
