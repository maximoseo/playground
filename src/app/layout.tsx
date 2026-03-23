import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/ui/providers";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Playground Keyword Research",
  description: "Premium keyword research app powered by Keywords Everywhere API.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full bg-[radial-gradient(circle_at_top,#dbeafe,transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_45%,#f8fafc_100%)] text-slate-950 antialiased dark:bg-[radial-gradient(circle_at_top,#0f172a,transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_50%,#020617_100%)] dark:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
