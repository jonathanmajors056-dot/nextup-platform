import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NextUp — verified opportunities",
    short_name: "NextUp",
    description: "A focused feed of verified opportunities for students and early-career builders.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f8fc",
    theme_color: "#10233f",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" }],
  };
}
