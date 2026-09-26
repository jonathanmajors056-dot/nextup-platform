import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexa.ai — Think clearly. Build boldly.",
  description: "A thoughtful AI workspace for clear answers, better code, and forward motion.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
