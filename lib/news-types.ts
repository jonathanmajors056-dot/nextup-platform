export const newsCategories = [
  "AI", "Startups", "Cybersecurity", "Software", "Hardware", "Cloud", "Developer tools", "Policy", "Markets", "Jobs", "India tech", "Gadgets",
] as const;

export type NewsCategory = (typeof newsCategories)[number];
export type NewsStatus = "draft" | "published" | "archived";
export type NewsVerification = "officially_verified" | "publisher_feed" | "community_submitted" | "awaiting_review" | "expired";
export type NewsSourceType = "rss" | "official_api" | "publisher" | "manual" | "video";

export type NewsItem = {
  id: string;
  headline: string;
  summary: string;
  publisher: string;
  canonicalUrl: string;
  sourceUrl: string;
  sourceType: NewsSourceType;
  author: string;
  publishedAt: string;
  updatedAt: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  category: NewsCategory;
  tags: string[];
  topics: string[];
  geography: "India" | "Global" | "India + Global";
  entities: string[];
  language: string;
  readingMinutes: number;
  fingerprint: string;
  verificationStatus: NewsVerification;
  status: NewsStatus;
  ingestedAt: string;
  freshUntil: string;
  isBreaking: boolean;
  isSponsored: boolean;
};

export type NewsDraft = Omit<NewsItem, "id" | "ingestedAt" | "fingerprint"> & {
  id?: string;
  ingestedAt?: string;
  fingerprint?: string;
};

export type NewsCandidate = {
  providerId: string;
  externalId?: string;
  headline: string;
  summary?: string;
  description?: string;
  publisher: string;
  canonicalUrl: string;
  sourceUrl?: string;
  author?: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  category?: NewsCategory;
  tags?: string[];
  topics?: string[];
  geography?: NewsItem["geography"];
  entities?: string[];
  language?: string;
  isBreaking?: boolean;
  isSponsored?: boolean;
  rawSource?: string;
};

export type NewsProvider = {
  id: string;
  name: string;
  kind: NewsSourceType;
  regions: string[];
  status: "configured" | "needs_configuration" | "disabled" | "error";
  sourceUrl?: string;
  lastRunAt?: string | null;
  lastSuccessAt?: string | null;
  lastError?: string | null;
};
