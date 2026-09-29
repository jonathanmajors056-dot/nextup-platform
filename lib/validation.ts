import { z } from "zod";
import { categories } from "./types";

const httpUrl = z.string().max(2048).url().refine((value) => {
  const protocol = new URL(value).protocol;
  return protocol === "http:" || protocol === "https:";
}, "URL must use http or https");

export const submissionSchema = z.object({
  rawText: z.string().min(20, "Paste the full opportunity message so the AI can extract it.").max(30000, "Opportunity messages must be 30,000 characters or less."),
  sourceUrl: httpUrl.optional().or(z.literal("")),
  sourceType: z.enum(["manual", "whatsapp", "official", "community"]).default("manual"),
});

export const opportunitySchema = z.object({
  title: z.string().min(3),
  description: z.string().default(""),
  summary: z.string().default(""),
  category: z.enum(categories).default("Other"),
  organizer: z.string().default(""),
  officialUrl: httpUrl,
  sourceUrl: httpUrl.or(z.literal("")),
  sourceType: z.enum(["manual", "whatsapp", "official", "community"]),
  format: z.enum(["online", "offline", "hybrid"]).default("online"),
  location: z.string().default(""),
  eventStartDate: z.string().nullable().default(null),
  eventEndDate: z.string().nullable().default(null),
  registrationDeadline: z.string().nullable().default(null),
  eligibility: z.string().default(""),
  fees: z.string().default(""),
  benefit: z.string().default(""),
  skills: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  verificationStatus: z
    .enum(["awaiting_review", "community_submitted", "officially_verified", "rejected", "expired"])
    .default("awaiting_review"),
  aiConfidence: z.number().min(0).max(1).default(0),
  status: z.enum(["draft", "published", "archived", "rejected"]).default("draft"),
  rawSource: z.string().optional(),
  lastVerifiedAt: z.string().nullable().default(null),
});
