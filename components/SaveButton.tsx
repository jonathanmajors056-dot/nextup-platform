"use client";

import { useState } from "react";

export function SaveButton({ opportunityId }: { opportunityId: string }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function save() {
    setBusy(true);
    setError(false);
    try {
      const response = await fetch(`/api/opportunities/${opportunityId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) setSaved(true);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return <span className="save-action"><button className="button button-secondary" onClick={save} disabled={busy || saved}>{saved ? "Saved ✓" : busy ? "Saving…" : "Save opportunity"}</button>{error && <small className="action-error" role="status">Couldn’t save. Try again.</small>}</span>;
}
