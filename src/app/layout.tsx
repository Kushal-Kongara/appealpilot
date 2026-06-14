import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AppealPilot — AI-Powered Insurance Appeal Assistant",
  description:
    "Turn confusing health insurance denial letters into a complete, professional appeal package in seconds.",
  keywords: ["insurance appeal", "health insurance", "denial letter", "medical appeal", "AI"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-slate-50 antialiased">{children}</body>
    </html>
  );
}
