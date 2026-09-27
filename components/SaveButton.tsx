"use client";

import { useState } from "react";

export function SaveButton({ opportunityId }: { opportunityId: string }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const response = await fetch(`/api/opportunities/${opportunityId}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    setBusy(false);
    if (response.ok) setSaved(true);
  }

  return <button className="button button-secondary" onClick={save} disabled={busy || saved}>{saved ? "Saved ✓" : busy ? "Saving…" : "Save opportunity"}</button>;
}
