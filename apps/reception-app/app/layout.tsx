import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DAIH — Reception & Access Scanner",
  description:
    "Fast QR scanner, check-in, check-out, and access validation terminal for DAIH Officers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-screen bg-slate-950 text-slate-100"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
