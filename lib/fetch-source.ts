type CachedResponse = { expiresAt: number; body: string };
const globalCache = globalThis as typeof globalThis & { __nextupSourceCache?: Map<string, CachedResponse> };
const cache = globalCache.__nextupSourceCache ?? new Map<string, CachedResponse>();
globalCache.__nextupSourceCache = cache;

export async function fetchApprovedSource(url: string) {
  const existing = cache.get(url);
  if (existing && existing.expiresAt > Date.now()) return { body: existing.body, cached: true };
  const response = await fetch(url, { headers: { "User-Agent": "NextUp-opportunity-ingestor/1.0 (+admin-approved-source)" }, signal: AbortSignal.timeout(10000), next: { revalidate: 300 } });
  if (!response.ok) throw new Error(`Source returned HTTP ${response.status}.`);
  const body = await response.text();
  if (body.length > 2_000_000) throw new Error("Source response is larger than the safe ingestion limit.");
  cache.set(url, { body, expiresAt: Date.now() + 5 * 60 * 1000 });
  return { body, cached: false };
}
