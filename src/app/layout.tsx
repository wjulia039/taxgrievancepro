import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";

import "./globals.css";

import { Toaster } from "@/components/ui/sonner";

const heading = Fraunces({
  variable: "--font-heading",
  subsets: ["latin"],
});

const body = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "TaxGrievancePro",
  description:
    "Generate a first-pass property tax appeal kit for Suffolk County, NY.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body className="min-h-dvh bg-background font-[var(--font-body)] text-foreground antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
