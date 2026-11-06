// All personal copy lives here, so you can edit text without touching layout code.
// Later this moves into the Supabase `profile_sections` table and feeds the AI chat.

export const profile = {
  name: "Nurarat Sangreuang",
  shortName: "Nurarat",
  role: "Full-stack Software Developer",
  location: "Bangkok, Thailand",
  timezone: "Asia/Bangkok",
  headline: "Full-stack engineer — .NET & Next.js — who builds AI features that actually ship.",
  availability: "Open to UK roles",
  relocation:
    "Happy to relocate to the UK with visa sponsorship, or to work fully remote for a UK team.",
  github: "https://github.com/Issacboox",
  email: "nurarat0024@gmail.com",
  linkedin: "https://www.linkedin.com/in/nurarat-sangreuang-b62839298",
  /** Path to the CV PDF in /public. Leave empty to hide the Download CV button. */
  cv: "/cv/Nurarat_Sangreuang_CV.pdf" as string,
  /** Path to the cover letter PDF in /public. Leave empty to hide its button. */
  coverLetter: "/cv/Nurarat_Sangreuang_Cover_Letter.pdf" as string,
};

export const stack = [
  ".NET 10",
  "C#",
  "ASP.NET Core",
  "Node.js",
  "Next.js",
  "React",
  "React Native",
  "TypeScript",
  "SQL Server",
  "PostgreSQL",
  "Oracle",
  "Docker",
  "OpenShift",
  "Tekton CI/CD",
  "RabbitMQ",
  "Supabase",
  "Claude API",
  "Ollama",
  "Figma",
  "Roblox Studio (Luau)",
];

export const focusAreas = [
  {
    title: "Backend that holds up",
    body: "Two years building C# / .NET APIs in production: e-Quotation, e-Commerce and car sales platforms, plus enterprise integrations with Oracle WebCenter Content and K2.",
    tags: ["C#", ".NET", "SQL"],
  },
  {
    title: "Full-stack, end to end",
    body: "I ship both sides myself — Next.js and React on the front, .NET on the back, React Native when it needs to be on a phone.",
    tags: ["Next.js", "React", "React Native"],
  },
  {
    title: "From idea to design",
    body: "I also work as BA / SA and do UX/UI: gathering requirements, writing specs, designing the data model and the screens before the code.",
    tags: ["UX/UI", "BA / SA", "DBA"],
  },
];

export type TimelineItem = {
  period: string;
  title: string;
  org: string;
  body: string;
  points?: string[];
  current?: boolean;
  next?: boolean;
};

export const timeline: TimelineItem[] = [
  {
    period: "Next",
    title: "Joining a UK team",
    org: "Your company?",
    body: "Looking for a full-stack or .NET role where I can ship product and grow with a strong engineering culture. Happy to relocate with visa sponsorship, or work remotely.",
    next: true,
  },
  {
    period: "Jul 2026 — now",
    title: "Software Developer",
    org: "BusOnlineTicket",
    body: "Full-time, fully remote. Working across both backend and frontend.",
    points: [
      "Implement new features end to end, across backend APIs and frontend.",
      "Integrate new vendors (operators) to pull in their data, and build tools to manage trips and routes.",
      "Built a LINE chatbot for customers and integrated a payment gateway.",
      "Integrated Facebook and Google, including pulling customer reviews from Google.",
      "Work directly with vendors on requirements, data formats and go-live.",
    ],
    current: true,
  },
  {
    period: "Aug 2024 — Jul 2026",
    title: "Software Developer",
    org: "Sirisoft Public Company Limited",
    body: "Backend developer on enterprise systems, working in an Agile Scrum team with Jira.",
    points: [
      "Designed and built .NET backend APIs for e-Quotation, e-Commerce and car sales platforms.",
      "Deployed services on OpenShift with Docker, and supported CI/CD with Tekton pipelines.",
      "Optimised database queries and API response handling for better performance and reliability.",
      "Integrated Oracle WebCenter Content (WCC) and K2 workflows for enterprise documents.",
      "Helped design the API specification for an AI data-ingestion workflow.",
      "Kept quality up with SonarQube and regular code reviews.",
    ],
  },
  {
    period: "Apr 2023 — Jun 2023",
    title: "Software Engineer Intern",
    org: "Toyota Material Handling Warehouse Solution (Thailand)",
    body: "My first taste of real-world software in a large organisation.",
    points: [
      "Built a ticketing website for reporting issues, tracking status and resolutions, with in-app messaging.",
      "Wrote web-based API documentation with stakeholders, aligned to company standards.",
      "Ran regular server room checks for performance, security and environmental issues.",
    ],
  },
  {
    period: "2020 — 2024",
    title: "B.Sc. Information Technology · GPA 3.13",
    org: "Burapha University",
    body: "Where it all started. Also passed the ITPE IT Passport (IP) examination.",
  },
];

export const askSuggestions = [
  "What has Nurarat built with .NET?",
  "Why does she want to work in the UK?",
  "Would she relocate to the UK?",
  "What's the AI on this site built with?",
];

export const workingStyle = [
  {
    title: "Scrum, every day",
    body: "I've worked in Agile Scrum teams with Jira for my whole career: sprint planning, stand-ups, reviews and retros are my normal rhythm.",
  },
  {
    title: "Remote-native",
    body: "I already work full-time remotely, so async updates, clear PRs and written handovers are second nature.",
  },
  {
    title: "Overlap with UK hours",
    body: "Bangkok is 6–7 hours ahead of London (7 in UK winter, 6 in summer), so my afternoon lines up with your morning.",
  },
  {
    title: "Always learning",
    body: "I genuinely enjoy picking up new things — Next.js, AI/RAG, 3D in Blender and game scripting in Roblox all started as side curiosity.",
  },
];

/** The flow I follow for a feature, from first question to shipped. */
export const process = [
  { step: "Plan", body: "Understand the problem with the team, break it into stories and agree what done means." },
  { step: "Analyse", body: "Requirements, user flows and system design (BA / SA), plus the data model." },
  { step: "Design", body: "UX/UI wireframes and screens, and the API contract before any code." },
  { step: "Build", body: "Front to back: database migration, API, UI. Small PRs, reviewed." },
  { step: "Test", body: "Unit tests (xUnit), SonarQube checks and testing with real data." },
  { step: "Ship & learn", body: "Deploy through CI/CD, demo in the sprint review, then improve from feedback." },
];

export type SkillGroup = { title: string; items: string[] };

export const skillGroups: SkillGroup[] = [
  { title: "Backend", items: [".NET 4.6 / 8 / 10", "C#", "ASP.NET Core", "Node.js", "REST APIs", "RabbitMQ"] },
  { title: "Frontend & mobile", items: ["React", "Next.js", "TypeScript", "JavaScript", "HTML / CSS", "React Native"] },
  { title: "Data & DBA", items: ["SQL Server", "PostgreSQL", "Oracle", "Database design", "Query optimisation"] },
  { title: "DevOps & platform", items: ["Docker", "OpenShift", "Tekton CI/CD", "AWS S3", "MinIO", "Git"] },
  { title: "Analysis & design", items: ["UX/UI design", "Business analysis (BA)", "System analysis (SA)", "API specification"] },
  { title: "Quality", items: ["xUnit", "SonarQube", "Code review", "Robot Framework (basic)"] },
  { title: "Integrations & AI", items: ["LINE chatbot", "Payment gateway", "Facebook & Google APIs", "Oracle WebCenter Content", "K2 workflows", "Claude API", "RAG", "Ollama / local LLMs", "vLLM", "pgvector", "LLM evals"] },
  { title: "Just for fun", items: ["Roblox games (Luau)", "Blender 3D"] },
];

export const skills = [
  "Backend APIs & enterprise integrations",
  "Full-stack web & mobile apps",
  "Databases, SQL & DBA work",
  "UX/UI design",
  "Business & system analysis (BA / SA)",
  "DevOps: Docker, OpenShift, CI/CD",
  "AI features & RAG",
  "Roblox game development (free time)",
];

export const languages = ["Thai (native)", "English (intermediate)"];

// Short labels shown on the black "tool" tiles (like app icons on a poster).
export const tools = [
  { short: ".NET", name: ".NET 10" },
  { short: "C#", name: "C#" },
  { short: "TS", name: "TypeScript" },
  { short: "Nx", name: "Next.js" },
  { short: "Re", name: "React" },
  { short: "RN", name: "React Native" },
  { short: "Pg", name: "PostgreSQL" },
  { short: "Sb", name: "Supabase" },
  { short: "AI", name: "Claude API" },
];

export type Project = {
  slug: string;
  title: string;
  summary: string;
  stack: string[];
  status: "Live" | "In progress" | "Building";
  url?: string;
  repo?: string;
  /** Screenshot under /public/images/projects. */
  image?: string;
};

// TODO: refine descriptions and add screenshots — these are short drafts.
export const projects: Project[] = [
  {
    slug: "nuros-portfolio",
    title: "NurOS — this portfolio",
    summary:
      "A desktop-style portfolio that runs in the browser, with an AI terminal that answers questions about my work from my own content and cites its sources (RAG on a free LLM).",
    stack: ["Next.js 16", "TypeScript", "Tailwind CSS", "RAG", "Groq / Ollama", "Supabase", "Three.js", "Blender", "Vercel", "PWA"],
    status: "Building",
    repo: "https://github.com/Issacboox",
    image: "/images/projects/nuros.webp",
  },
  {
    slug: "discord-team-bot",
    title: "Discord team assistant bot",
    summary:
      "An all-in-one Discord bot for a development team: answers questions with Claude, looks up Jira and Azure DevOps, posts Jira and Jenkins alerts, sends calendar reminders, runs a time clock, and saves every shared file to Google Drive. A React admin web controls it all live.",
    stack: ["Node.js", "discord.js", "Claude API", "Express", "React (Vite)", "Google Drive API", "Jira API", "Docker", "Jenkins"],
    status: "Live",
  },
  {
    slug: "private-llm-platform",
    title: "Private LLM platform",
    summary:
      "A self-hosted AI assistant for an office, running open models on our own hardware so data never leaves the building. It started as a prototype with Ollama on my PC (RTX 4060) and is built to move to a vLLM server. It has a chat console with live speed stats, knowledge bases with RAG and cited sources (pgvector + bge-m3), side-by-side model comparison, evals with pass rates, OCR, user permissions and an audit log. Multilingual: English, Thai, Chinese and Malay.",
    stack: ["Ollama", "vLLM", "Next.js 16", "TypeScript", "PostgreSQL + pgvector", "Docker", "Python", "RAG"],
    status: "Building",
  },
  {
    slug: "maru-desk",
    title: "Maru Desk",
    summary:
      "Back-office software I build and run on my own for small Thai businesses: quotes, invoices and receipts in a few clicks, PromptPay QR payments, and a clear view of who has paid and who still owes.",
    stack: ["Next.js", "React"],
    status: "Live",
    url: "https://marudesk.gogomaru.com",
    image: "/images/projects/maru-desk.webp",
  },
  {
    slug: "joybinitour",
    title: "JoybiniTour",
    summary:
      "Tour booking website, back office and API for curated tours in Phuket and Bangkok: live availability, card and PromptPay payments, PDF e-vouchers, and daily tools for the ops team.",
    stack: ["Next.js 16", ".NET 10", "EF Core", "PostgreSQL", "Redis", "Hangfire", "Omise", "pnpm monorepo", "Docker", "Jenkins", "GitHub Actions"],
    status: "In progress",
  },
  {
    slug: "maru-travel",
    title: "MARU travel booking",
    summary: "Redesign of a travel booking website and its back office, including partner (B2B) sign-up and approval.",
    stack: ["Next.js", ".NET"],
    status: "In progress",
  },
];

/** Posts I plan to write, shown as "Coming soon" in the Blog. */
export const plannedPosts: { title: string; tag: string }[] = [];
