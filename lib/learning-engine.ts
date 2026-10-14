import type { Opportunity } from "@/data/opportunities";

export type LearningEventType = "view" | "open" | "save" | "unsave" | "dismiss" | "feedback";

export type LearningEvent = {
  type: LearningEventType;
  opportunityId?: string;
  category?: string;
  format?: string;
  tags?: string[];
  value?: "useful" | "not-useful";
  timestamp: string;
};

export type LearningProfile = {
  categoryWeights: Record<string, number>;
  formatWeights: Record<string, number>;
  tagWeights: Record<string, number>;
  totalSignals: number;
  confidence: number;
  summary: string;
};

const emptyProfile = (): LearningProfile => ({ categoryWeights: {}, formatWeights: {}, tagWeights: {}, totalSignals: 0, confidence: 0, summary: "Keep exploring; your signal profile will learn from saves and feedback." });

function add(map: Record<string, number>, key: string | undefined, amount: number) {
  if (!key) return;
  map[key] = Math.max(-8, Math.min(8, (map[key] ?? 0) + amount));
}

export function deriveLearningProfile(events: LearningEvent[]): LearningProfile {
  const profile = emptyProfile();
  for (const event of events) {
    const direction = event.type === "dismiss" || event.type === "unsave" || event.value === "not-useful" ? -1 : 1;
    const amount = event.type === "save" ? 3 : event.type === "feedback" ? 4 : event.type === "dismiss" ? 2 : 1;
    add(profile.categoryWeights, event.category, direction * amount);
    add(profile.formatWeights, event.format, direction * amount);
    for (const tag of event.tags ?? []) add(profile.tagWeights, tag, direction * amount);
    profile.totalSignals += 1;
  }
  profile.confidence = Math.min(96, Math.round(profile.totalSignals * 8));
  const bestCategory = Object.entries(profile.categoryWeights).sort((a, b) => b[1] - a[1])[0];
  const bestTag = Object.entries(profile.tagWeights).sort((a, b) => b[1] - a[1])[0];
  profile.summary = bestCategory && bestCategory[1] > 0
    ? `Learning toward ${bestCategory[0].toLowerCase()} opportunities${bestTag && bestTag[1] > 0 ? ` and ${bestTag[0]} work` : ""}.`
    : "Keep exploring; your signal profile will learn from saves and feedback.";
  return profile;
}

export function scoreOpportunity(opportunity: Opportunity, profile: LearningProfile) {
  const category = profile.categoryWeights[opportunity.category] ?? 0;
  const format = profile.formatWeights[opportunity.format] ?? 0;
  const tags = opportunity.tags.reduce((score, tag) => score + (profile.tagWeights[tag] ?? 0), 0);
  return Math.round(50 + category * 5 + format * 2 + tags * 1.5 + (opportunity.verified ? 8 : 0));
}

export function rankOpportunities(opportunities: Opportunity[], profile: LearningProfile) {
  return [...opportunities].sort((a, b) => scoreOpportunity(b, profile) - scoreOpportunity(a, profile));
}
