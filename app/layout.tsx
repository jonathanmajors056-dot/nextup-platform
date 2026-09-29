import type { Metadata } from "next";
import { assertProductionConfig } from "@/lib/supabase/config";
import "./globals.css";

export const metadata: Metadata = {
  title: "MeasureSure - Online Verification System",
  description: "SIH26036 online verification system for weighing and measuring instruments.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  assertProductionConfig();

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
