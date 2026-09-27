import { z } from "zod";
import { categories } from "./types";

export const submissionSchema = z.object({
  rawText: z.string().min(20, "Paste the full opportunity message so the AI can extract it."),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  sourceType: z.enum(["manual", "whatsapp", "official", "community", "api", "rss"]).default("manual"),
});

export const opportunitySchema = z.object({
  title: z.string().min(3),
  description: z.string().default(""),
  summary: z.string().default(""),
  category: z.enum(categories).default("Other"),
  organizer: z.string().default(""),
  officialUrl: z.string().url(),
  sourceUrl: z.string().url().or(z.literal("")),
  sourceType: z.enum(["manual", "whatsapp", "official", "community", "api", "rss"]),
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
