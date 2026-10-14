export type OpportunityFormat = "online" | "offline" | "hybrid";

export type Opportunity = {
  id: string;
  title: string;
  organization: string;
  category: string;
  format: OpportunityFormat;
  location: string;
  deadline: string;
  deadlineLabel: string;
  description: string;
  eligibility: string;
  sourceUrl: string;
  verified: boolean;
  tags: string[];
};

export const opportunities: Opportunity[] = [
  { id: "orbit", title: "Student Space Systems Challenge", organization: "Orbital Research Network", category: "Competition", format: "hybrid", location: "Bengaluru + online", deadline: "2026-10-18", deadlineLabel: "18 OCT · 4 days left", description: "Design a mission concept that makes orbital research more accessible to the next generation.", eligibility: "Students and recent graduates working in teams of 2–5.", sourceUrl: "https://nextup-platform-gamma.vercel.app/", verified: true, tags: ["space", "team", "prototype"] },
  { id: "climate", title: "Open Climate Data Fellowship", organization: "Civic Climate Lab", category: "Fellowship", format: "online", location: "Global", deadline: "2026-10-26", deadlineLabel: "26 OCT · 12 days left", description: "Work with public datasets and build an evidence-backed tool for a local climate question.", eligibility: "Students with an interest in data, climate, or civic technology.", sourceUrl: "https://nextup-platform-gamma.vercel.app/", verified: true, tags: ["data", "6 weeks", "stipend"] },
  { id: "bio", title: "BioDesign Weekend", organization: "Makers in Biology", category: "Workshop", format: "offline", location: "Mumbai", deadline: "2026-11-02", deadlineLabel: "02 NOV · 19 days left", description: "A guided build sprint for students exploring biology, materials, and responsible design.", eligibility: "Open to undergraduate and postgraduate learners; no prior lab experience required.", sourceUrl: "https://nextup-platform-gamma.vercel.app/", verified: true, tags: ["biology", "beginner", "hands-on"] },
  { id: "ai", title: "Responsible AI Build Grant", organization: "Future Commons", category: "Grant", format: "online", location: "India", deadline: "2026-11-10", deadlineLabel: "10 NOV · 27 days left", description: "Turn a student research idea into a small, useful tool with a clear safety and impact plan.", eligibility: "Student founders and research teams based in India.", sourceUrl: "https://nextup-platform-gamma.vercel.app/", verified: true, tags: ["AI", "grant", "mentor"] },
];

export function getOpportunity(id: string) {
  return opportunities.find((opportunity) => opportunity.id === id);
}
