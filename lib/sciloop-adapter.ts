import { innovations } from "@/data/innovations";

export type SciloopSignal = {
  id: string;
  title: string;
  field: string;
  summary: string;
  source: string;
  sourceUrl: string;
  confidence: string;
  nextAction: string;
};

export function listSciloopSignals(): SciloopSignal[] {
  return innovations.map((innovation) => ({
    id: innovation.slug,
    title: innovation.title,
    field: innovation.field,
    summary: innovation.summary,
    source: innovation.source,
    sourceUrl: innovation.evidence[0]?.url ?? "https://sciloop-final.vercel.app/sciloop-live",
    confidence: innovation.decision.confidence,
    nextAction: innovation.decision.nextAction,
  }));
}

export async function readSciloopStatus() {
  const baseUrl = process.env.SCILOOP_BASE_URL?.replace(/\/+$/, "");
  if (!baseUrl) return { connected: false, mode: "local-adapter", detail: "Using the bundled SciLoop innovation records." };
  try {
    const response = await fetch(`${baseUrl}/api/system-status`, { cache: "no-store" });
    return { connected: response.ok, mode: "remote", baseUrl, status: response.status };
  } catch (error) {
    return { connected: false, mode: "remote-fallback", baseUrl, detail: error instanceof Error ? error.message : "Sciloop status unavailable" };
  }
}
