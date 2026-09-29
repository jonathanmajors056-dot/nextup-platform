import type { Metadata } from "next";
import { assertProductionConfig } from "@/lib/supabase/config";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexa.ai — Think clearly. Build boldly.",
  description: "A thoughtful AI workspace for clear answers, better code, and forward motion.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  assertProductionConfig();

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
