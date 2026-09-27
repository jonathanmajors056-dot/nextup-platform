export const categories = [
  "Hackathon",
  "Competition",
  "Workshop",
  "Scholarship",
  "Internship",
  "Conference",
  "Job",
  "Other",
] as const;

export type Category = (typeof categories)[number];
export type OpportunityStatus = "draft" | "published" | "archived" | "rejected";
export type VerificationStatus =
  | "awaiting_review"
  | "community_submitted"
  | "officially_verified"
  | "rejected"
  | "expired";

export type Opportunity = {
  id: string;
  title: string;
  description: string;
  summary: string;
  category: Category;
  organizer: string;
  officialUrl: string;
  sourceUrl: string;
  sourceType: "manual" | "whatsapp" | "official" | "community" | "api" | "rss";
  format: "online" | "offline" | "hybrid";
  location: string;
  eventStartDate: string | null;
  eventEndDate: string | null;
  registrationDeadline: string | null;
  eligibility: string;
  fees: string;
  benefit: string;
  skills: string[];
  tags: string[];
  verificationStatus: VerificationStatus;
  aiConfidence: number;
  status: OpportunityStatus;
  rawSource?: string;
  lastVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  latitude?: number | null;
  longitude?: number | null;
  distanceKm?: number | null;
};

export type OpportunityDraft = Omit<Opportunity, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Submission = {
  id: string;
  rawText: string;
  sourceType: Opportunity["sourceType"];
  sourceUrl: string;
  createdAt: string;
  opportunityId: string;
};

export type ProviderKind = "official_api" | "rss" | "organizer" | "manual";
export type ProviderStatus = "configured" | "needs_configuration" | "disabled" | "error";

export type OpportunityProvider = {
  id: string;
  name: string;
  kind: ProviderKind;
  regions: string[];
  supportsOnline: boolean;
  status: ProviderStatus;
  sourceUrl?: string;
  lastRunAt?: string | null;
  lastSuccessAt?: string | null;
  lastError?: string | null;
};

export type IngestionCandidate = {
  providerId: string;
  externalId?: string;
  title: string;
  description?: string;
  summary?: string;
  category?: Category;
  organizer?: string;
  officialUrl: string;
  sourceUrl?: string;
  format?: Opportunity["format"];
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
  eventStartDate?: string | null;
  eventEndDate?: string | null;
  registrationDeadline?: string | null;
  eligibility?: string;
  fees?: string;
  benefit?: string;
  skills?: string[];
  tags?: string[];
  rawSource?: string;
};

export type LocationPreference = {
  userId: string;
  label: string;
  city: string;
  region: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  precision: "city" | "country" | "approximate";
  consentedToGeolocation: boolean;
  radiusKm: number;
  updatedAt: string;
};
