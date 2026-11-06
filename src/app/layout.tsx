import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { RegisterServiceWorker } from "@/components/os/register-sw";
import { profile } from "@/content/profile";
import { siteDescription, siteName, siteUrl } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const title = `${profile.name} — Full-stack Developer (.NET & Next.js) · NurOS`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: `%s · ${profile.name}` },
  description: siteDescription,
  applicationName: "NurOS",
  authors: [{ name: profile.name, url: profile.linkedin }],
  creator: profile.name,
  keywords: [
    "Nurarat Sangreuang",
    "Maru",
    "full-stack developer",
    ".NET developer",
    "C# developer",
    "Next.js developer",
    "React developer",
    "software developer Bangkok",
    "UK visa sponsorship",
    "remote developer",
    "portfolio",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: "/",
    siteName,
    title,
    description: siteDescription,
    locale: "en_GB",
    firstName: "Nurarat",
    lastName: "Sangreuang",
  },
  twitter: { card: "summary_large_image", title, description: siteDescription },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  appleWebApp: { capable: true, title: "NurOS", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7d9cd" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0b1e" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="h-full overflow-hidden bg-black">
        {children}
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
