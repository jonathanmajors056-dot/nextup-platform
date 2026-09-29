import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "nexa/ops — Autonomous workflow control room",
  description: "Design, run, and observe autonomous multi-agent workflows.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
