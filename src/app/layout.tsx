import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nurarat Sangreuang — Full-stack Developer · NurOS",
  description:
    "Portfolio of Nurarat Sangreuang, a full-stack .NET & Next.js developer in Bangkok, open to UK roles. Explore NurOS and ask the AI terminal about my work.",
};

export const viewport: Viewport = {
  themeColor: "#f7d9cd",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="h-full overflow-hidden bg-black">{children}</body>
    </html>
  );
}
