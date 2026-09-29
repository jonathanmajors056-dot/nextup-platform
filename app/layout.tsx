import type { Metadata } from "next";
import { assertProductionConfig } from "@/lib/supabase/config";
import "./globals.css";

export const metadata: Metadata = {
  title: "NextUp — verified opportunities",
  description: "Find one trusted student opportunity worth your week, with deadlines and source context.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  assertProductionConfig();

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
