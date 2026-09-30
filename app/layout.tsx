import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NextUp — verified opportunities",
  description: "A focused feed of verified opportunities for students and early-career builders.",
  applicationName: "NextUp",
  keywords: ["student opportunities", "hackathons", "events", "India", "internships"],
  openGraph: { title: "NextUp — verified opportunities", description: "Find the next opportunity worth your attention.", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
