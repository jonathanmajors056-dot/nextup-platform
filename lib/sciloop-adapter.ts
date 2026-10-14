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

function localSignals() {
  return { source: "sciloop-local-adapter", signals: listSciloopSignals(), connected: false };
}

export async function readSciloopSignals() {
  const baseUrl = process.env.SCILOOP_BASE_URL?.replace(/\/+$/, "");
  if (!baseUrl) return localSignals();
  try {
    const response = await fetch(`${baseUrl}/api/sciloop-ai-proxy/news?topic=science`, { cache: "no-store", signal: AbortSignal.timeout(6000) });
    if (!response.ok) throw new Error(`SciLoop feed returned ${response.status}`);
    const payload = await response.json() as { articles?: unknown[] };
    const signals = (payload.articles ?? []).flatMap((article): SciloopSignal[] => {
      if (!article || typeof article !== "object") return [];
      const item = article as Record<string, unknown>;
      const title = typeof item.title === "string" ? item.title : "";
      if (!title) return [];
      const slug = typeof item.slug === "string" && item.slug ? item.slug : title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return [{ id: slug, title, field: typeof item.subject === "string" ? item.subject : "Live innovation", summary: typeof item.summary === "string" ? item.summary : "A SciLoop signal ready for student exploration.", source: typeof item.source === "string" ? item.source : "SciLoop source layer", sourceUrl: typeof item.url === "string" ? item.url : `${baseUrl}/sciloop/live/${slug}`, confidence: "Emerging evidence", nextAction: "Watch" }];
    });
    return signals.length ? { source: "sciloop-remote-adapter", signals, connected: true } : localSignals();
  } catch {
    return { ...localSignals(), source: "sciloop-remote-fallback" };
  }
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
