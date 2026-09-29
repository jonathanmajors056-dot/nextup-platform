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
  sourceType: "manual" | "whatsapp" | "official" | "community";
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
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
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
  status?: "queued" | "processing" | "completed" | "failed";
  submittedBy?: string | null;
  opportunityId?: string | null;
  idempotencyKey?: string | null;
  attemptCount?: number;
  errorMessage?: string | null;
  updatedAt?: string;
  processedAt?: string | null;
};

export type AuditAction =
  | "submission_queued"
  | "submission_processing"
  | "submission_completed"
  | "submission_failed"
  | "opportunity_extracted"
  | "opportunity_published"
  | "opportunity_archived";

export type AuditEntry = {
  id: string;
  opportunityId: string | null;
  actorId: string | null;
  action: AuditAction | string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export const applicationStatuses = ["saved", "applying", "applied", "shortlisted", "won", "not_selected"] as const;
export type ApplicationStatus = (typeof applicationStatuses)[number];
