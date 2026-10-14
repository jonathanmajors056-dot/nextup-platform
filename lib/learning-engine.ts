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

export const LEARNING_MODEL_VERSION = "adaptive-v1.5";

const eventTypes = new Set<LearningEventType>(["view", "open", "save", "unsave", "dismiss", "feedback"]);

export function normalizeLearningEvent(value: unknown): LearningEvent | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  const type = candidate.type;
  const timestamp = candidate.timestamp;
  if (typeof type !== "string" || !eventTypes.has(type as LearningEventType) || typeof timestamp !== "string" || !timestamp || Number.isNaN(Date.parse(timestamp))) return null;
  const valueSignal = candidate.value === "useful" || candidate.value === "not-useful" ? candidate.value : undefined;
  return {
    type: type as LearningEventType,
    opportunityId: typeof candidate.opportunityId === "string" ? candidate.opportunityId : undefined,
    category: typeof candidate.category === "string" ? candidate.category : undefined,
    format: typeof candidate.format === "string" ? candidate.format : undefined,
    tags: Array.isArray(candidate.tags) ? candidate.tags.filter((tag): tag is string => typeof tag === "string").slice(0, 12) : [],
    value: valueSignal,
    timestamp,
  };
}

export function learningEventKey(event: LearningEvent) {
  return [event.type, event.opportunityId ?? "", event.category ?? "", event.format ?? "", event.value ?? "", event.timestamp].join("|");
}

export type LearningProfile = {
  categoryWeights: Record<string, number>;
  formatWeights: Record<string, number>;
  tagWeights: Record<string, number>;
  opportunityWeights: Record<string, number>;
  seenOpportunityIds: string[];
  totalSignals: number;
  feedbackCount: number;
  usefulFeedback: number;
  feedbackQuality: number | null;
  nextAction: string;
  confidence: number;
  summary: string;
  modelVersion: string;
  topPreferences: string[];
};

const emptyProfile = (): LearningProfile => ({ categoryWeights: {}, formatWeights: {}, tagWeights: {}, opportunityWeights: {}, seenOpportunityIds: [], totalSignals: 0, feedbackCount: 0, usefulFeedback: 0, feedbackQuality: null, nextAction: "Open one opportunity and tell the model what you think.", confidence: 0, summary: "Keep exploring; your signal profile will learn from saves and feedback.", modelVersion: LEARNING_MODEL_VERSION, topPreferences: [] });

function add(map: Record<string, number>, key: string | undefined, amount: number) {
  if (!key) return;
  map[key] = Math.max(-8, Math.min(8, (map[key] ?? 0) + amount));
}

export function deriveLearningProfile(events: LearningEvent[]): LearningProfile {
  const profile = emptyProfile();
  const referenceTime = Math.max(Date.now(), ...events.map((event) => Date.parse(event.timestamp)).filter(Number.isFinite));
  for (const event of events) {
    const direction = event.type === "dismiss" || event.type === "unsave" || event.value === "not-useful" ? -1 : 1;
    const amount = event.type === "save" ? 3 : event.type === "feedback" ? 4 : event.type === "dismiss" ? 2 : 1;
    const age = Math.max(0, referenceTime - Date.parse(event.timestamp));
    const recency = 0.35 + (0.65 * Math.exp(-age / (1000 * 60 * 60 * 24 * 30)));
    const weightedAmount = direction * amount * recency;
    add(profile.categoryWeights, event.category, weightedAmount);
    add(profile.formatWeights, event.format, weightedAmount);
    for (const tag of event.tags ?? []) add(profile.tagWeights, tag, weightedAmount);
    if (event.opportunityId) {
      add(profile.opportunityWeights, event.opportunityId, weightedAmount);
      if (!profile.seenOpportunityIds.includes(event.opportunityId)) profile.seenOpportunityIds.push(event.opportunityId);
    }
    profile.totalSignals += 1;
    if (event.type === "feedback" && event.value) {
      profile.feedbackCount += 1;
      if (event.value === "useful") profile.usefulFeedback += 1;
    }
  }
  profile.feedbackQuality = profile.feedbackCount ? Math.round((profile.usefulFeedback / profile.feedbackCount) * 100) : null;
  profile.confidence = Math.min(96, Math.round(profile.totalSignals * 8));
  const bestCategory = Object.entries(profile.categoryWeights).sort((a, b) => b[1] - a[1])[0];
  const bestTag = Object.entries(profile.tagWeights).sort((a, b) => b[1] - a[1])[0];
  profile.topPreferences = [...Object.entries(profile.categoryWeights).map(([key, value]) => ({ key, value })), ...Object.entries(profile.tagWeights).map(([key, value]) => ({ key, value }))].filter((item) => item.value > 0).sort((a, b) => b.value - a.value).slice(0, 3).map((item) => item.key);
  profile.summary = profile.feedbackQuality !== null && profile.feedbackQuality < 50 && profile.feedbackCount >= 2
    ? "Broadening your stream after mixed feedback; tell the model what to keep."
    : bestCategory && bestCategory[1] > 0
    ? `Learning toward ${bestCategory[0].toLowerCase()} opportunities${bestTag && bestTag[1] > 0 ? ` and ${bestTag[0]} work` : ""}.`
    : "Keep exploring; your signal profile will learn from saves and feedback.";
  profile.nextAction = profile.feedbackQuality !== null && profile.feedbackQuality < 50 && profile.feedbackCount >= 2
    ? "Try one signal outside your current orbit, then mark it useful or not useful."
    : bestCategory && bestCategory[1] > 0
      ? `Explore one more ${bestCategory[0].toLowerCase()} opportunity while your signal is fresh.`
      : "Open one opportunity and tell the model what you think.";
  return profile;
}

export function scoreOpportunity(opportunity: Opportunity, profile: LearningProfile) {
  const category = profile.categoryWeights[opportunity.category] ?? 0;
  const format = profile.formatWeights[opportunity.format] ?? 0;
  const tags = opportunity.tags.reduce((score, tag) => score + (profile.tagWeights[tag] ?? 0), 0);
  const item = profile.opportunityWeights[opportunity.id] ?? 0;
  const unseen = !profile.seenOpportunityIds.includes(opportunity.id);
  const lowConfidenceExploration = profile.confidence < 60 && unseen ? 3 : 0;
  const feedbackRecoveryExploration = profile.feedbackQuality !== null && profile.feedbackQuality < 50 && unseen ? 3 : 0;
  const exploration = lowConfidenceExploration + feedbackRecoveryExploration;
  return Math.round(50 + category * 5 + format * 2 + tags * 1.5 + item * 2.5 + exploration + (opportunity.verified ? 8 : 0));
}

export function explainOpportunity(opportunity: Opportunity, profile: LearningProfile) {
  const itemWeight = profile.opportunityWeights[opportunity.id] ?? 0;
  const reasons = [
    itemWeight < 0 ? "de-prioritized by recent feedback" : itemWeight > 0 ? "reinforced by your recent signal" : undefined,
    (profile.categoryWeights[opportunity.category] ?? 0) > 0 ? `matches your ${opportunity.category.toLowerCase()} interest` : "keeps your stream broad",
    ...opportunity.tags.filter((tag) => (profile.tagWeights[tag] ?? 0) > 0).slice(0, 2).map((tag) => `matches your ${tag} signal`),
    opportunity.verified ? "source verified" : "awaiting source review",
  ].filter((reason): reason is string => Boolean(reason));
  return reasons.slice(0, 2).join(" · ");
}

export function rankOpportunities(opportunities: Opportunity[], profile: LearningProfile) {
  return [...opportunities].sort((a, b) => scoreOpportunity(b, profile) - scoreOpportunity(a, profile));
}
