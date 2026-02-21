import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaxGrievancePro - Lower Your Property Taxes",
  description:
    "Create a professional property tax appeal letter in minutes. Lower your property taxes with our step-by-step guide.",
  icons: {
    icon: "https://ext.same-assets.com/2250502627/1377171616.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
