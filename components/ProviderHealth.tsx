"use client";

import { useState } from "react";
import type { OpportunityProvider } from "@/lib/types";

export function ProviderHealth({ initial }: { initial: OpportunityProvider[] }) {
  const [providers, setProviders] = useState(initial);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function sync() {
    setBusy(true); setMessage("");
    const response = await fetch("/api/admin/sync", { method: "POST" });
    const data = await response.json().catch(() => ({}));
    const refreshed = await fetch("/api/admin/providers").then((result) => result.json()).catch(() => null);
    if (refreshed?.providers) setProviders(refreshed.providers);
    setBusy(false);
    setMessage(response.ok ? `${data.synced ?? 0} new draft${data.synced === 1 ? "" : "s"} imported. Review before publishing.` : (data.error || "Source sync failed."));
  }

  return <section className="card form-card provider-panel" style={{ gridColumn: "1 / -1" }}><div className="section-heading" style={{ marginTop: 0 }}><div><span className="section-label">Source monitor</span><h2>Approved sources</h2><p>Only configured sources can enter the review pipeline. Sync never publishes automatically.</p></div><button className="button button-primary" onClick={sync} disabled={busy}>{busy ? "Syncing…" : "Sync approved sources"}</button></div><div className="provider-list">{providers.map((provider) => <div className="provider-row" key={provider.id}><div><strong>{provider.name}</strong><small>{provider.kind.replace("_", " ")} · {provider.regions.join(" / ")}</small></div><span className={`provider-status ${provider.status}`}>{provider.status.replace("_", " ")}</span><small>{provider.lastError || (provider.lastSuccessAt ? `Last success ${new Date(provider.lastSuccessAt).toLocaleString("en-IN")}` : "No sync yet")}</small></div>)}</div>{message && <p className="provider-message">{message}</p>}</section>;
}
