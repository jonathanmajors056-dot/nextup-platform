import type { OpportunityProvider, ProviderStatus } from "./types";

type Health = { status: ProviderStatus; lastRunAt: string | null; lastSuccessAt: string | null; lastError: string | null };
const globalHealth = globalThis as typeof globalThis & { __nextupSourceHealth?: Record<string, Health> };
const health = globalHealth.__nextupSourceHealth ?? {};
globalHealth.__nextupSourceHealth = health;

export function recordSourceRun(providerId: string, result: { ok: boolean; error?: string }) {
  const now = new Date().toISOString();
  health[providerId] = { status: result.ok ? "configured" : "error", lastRunAt: now, lastSuccessAt: result.ok ? now : (health[providerId]?.lastSuccessAt ?? null), lastError: result.ok ? null : (result.error ?? "Unknown provider error") };
}

export function mergeHealth(provider: OpportunityProvider): OpportunityProvider {
  return { ...provider, ...(health[provider.id] ?? {}) };
}
