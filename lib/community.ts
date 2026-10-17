export type CommunityGroup = {
  id: string;
  name: string;
  focus: string;
  location: string;
  description: string;
  sourceUrl?: string;
};

// Curated from the local NextUp source at C:\Users\tajfa\Documents\Qoder\2026-10-13\6c824f3f.
// Keep public community pages as the source of truth; do not invent private invite links.
export const communityGroups: CommunityGroup[] = [
  {
    id: "hyderabad-community-connect",
    name: "Hyderabad Community Connect",
    focus: "Technology · Product · Networking",
    location: "Hyderabad",
    description: "Builders and product people sharing practical experience, local events, and founder conversations.",
    sourceUrl: "https://hubplus.ai/h/ledbycommunity/chapters/hyderabad/events/hyderabad-community-connect-technology-product-people",
  },
  {
    id: "women-in-ai-hyderabad",
    name: "Women in AI — Hyderabad",
    focus: "AI · Careers · Community",
    location: "Hyderabad",
    description: "Talks, panels, and networking with women building in AI and technology.",
  },
  {
    id: "global-ai-community",
    name: "Global AI Community — Hyderabad",
    focus: "AI · GenAI · Developer community",
    location: "Hyderabad",
    description: "Community-led AI sessions, hands-on demos, and local opportunities for builders.",
    sourceUrl: "https://globalai.community/e/hsbpakv9",
  },
  {
    id: "finops-hyderabad",
    name: "FinOps Community — Hyderabad",
    focus: "Cloud · FinOps · Platform",
    location: "Hyderabad",
    description: "Practitioner conversations about cloud financial operations, benchmarks, and platform costs.",
    sourceUrl: "https://community.finos.org/event/hyderabadfinopsmeetup",
  },
  {
    id: "kramers-community",
    name: "Kramer's Community",
    focus: "Open source · Web3 · Hackathons",
    location: "Hyderabad",
    description: "Local build-and-connect events for developers, students, and open-source contributors.",
    sourceUrl: "https://events.mlh.com/events/14891-hacktoberfest-hack-day-hyderabad-x-kramer-s-community",
  },
];

export const nextUpWhatsAppNumber = "919579317397";
export const nextUpWhatsAppHref = `https://wa.me/${nextUpWhatsAppNumber}`;

export function nextUpWhatsAppLink(message: string) {
  return `${nextUpWhatsAppHref}?text=${encodeURIComponent(message)}`;
}
