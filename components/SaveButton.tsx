"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

export function SaveButton({ opportunityId }: { opportunityId: string }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    setBusy(true);
    trackEvent("save_clicked", opportunityId);
    const response = await fetch(`/api/opportunities/${opportunityId}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    setBusy(false);
    if (response.ok) {
      setMessage("");
      setSaved(true);
      return;
    }
    if (response.status === 401) {
      setMessage("Sign in to save this.");
      return;
    }
    setMessage("Could not save right now.");
  }

  const next = encodeURIComponent(`/opportunities/${opportunityId}`);
  return <span style={{ display: "inline-flex", flexDirection: "column", gap: 5, alignItems: "flex-start" }}><button className="button button-secondary" onClick={save} disabled={busy || saved}>{saved ? "Saved ✓" : busy ? "Saving…" : "Save opportunity"}</button>{message && <a href={`/login?next=${next}`} style={{ color: "var(--blue)", fontSize: 12 }}>{message}</a>}</span>;
}
