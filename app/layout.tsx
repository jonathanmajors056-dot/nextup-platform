import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "dbatu.notes — B.Tech Student Library",
  description: "Structured notes, question papers, and practical files for DBATU engineering students.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
