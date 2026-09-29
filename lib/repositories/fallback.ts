import fs from "node:fs";
import path from "node:path";
import { demoOpportunities } from "@/lib/demo-data";
import type { ApplicationStatus, AuditEntry, Opportunity, Submission } from "@/lib/types";

export type StoreState = {
  opportunities: Opportunity[];
  submissions: Submission[];
  audit: AuditEntry[];
  saved: Record<string, string[]>;
  progress: Record<string, Record<string, ApplicationStatus>>;
};

const fallbackDataPath = path.join(process.cwd(), "data", "nextup.json");

function newFallbackState(): StoreState {
  return { opportunities: [...demoOpportunities], submissions: [], audit: [], saved: {}, progress: {} };
}

function loadFallbackState(): StoreState {
  try {
    if (!fs.existsSync(fallbackDataPath)) return newFallbackState();
    const parsed = JSON.parse(fs.readFileSync(fallbackDataPath, "utf8")) as Partial<StoreState>;
    if (Array.isArray(parsed.opportunities) && Array.isArray(parsed.submissions) && parsed.saved && typeof parsed.saved === "object") {
      return {
        ...(parsed as StoreState),
        audit: Array.isArray(parsed.audit) ? parsed.audit : [],
        progress: parsed.progress && typeof parsed.progress === "object" ? parsed.progress : {},
      };
    }
  } catch (error) {
    console.warn("NextUp local data could not be loaded; starting from seed records.", error);
  }
  return newFallbackState();
}

const globalStore = globalThis as typeof globalThis & { __opportunityStore?: StoreState };
export const fallbackState: StoreState = globalStore.__opportunityStore ?? loadFallbackState();
// Hot reloads and older local JSON files may predate the progress field.
// Normalize them in memory so adding a retention feature cannot break the feed.
fallbackState.progress ??= {};
globalStore.__opportunityStore = fallbackState;

export function persistFallbackState() {
  try {
    fs.mkdirSync(path.dirname(fallbackDataPath), { recursive: true });
    fs.writeFileSync(fallbackDataPath, JSON.stringify(fallbackState, null, 2), "utf8");
  } catch (error) {
    console.warn("NextUp local data could not be persisted; changes remain in memory.", error);
  }
}
