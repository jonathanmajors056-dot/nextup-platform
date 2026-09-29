"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import type { ApplicationStatus } from "@/lib/types";

const choices: Array<{ value: ApplicationStatus; label: string }> = [
  { value: "saved", label: "Saved" },
  { value: "applying", label: "Applying" },
  { value: "applied", label: "Applied" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "won", label: "Won" },
  { value: "not_selected", label: "Not selected" },
];

export function ProgressButton({ opportunityId, initialStatus }: { opportunityId: string; initialStatus: ApplicationStatus | null }) {
  const [status, setStatus] = useState<ApplicationStatus>(initialStatus ?? "saved");
  const [message, setMessage] = useState("");

  async function update(nextStatus: ApplicationStatus) {
    setMessage("");
    const response = await fetch(`/api/opportunities/${opportunityId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (response.ok) {
      setStatus(nextStatus);
      trackEvent("progress_updated", opportunityId, { status: nextStatus });
      return;
    }
    if (response.status === 401) {
      setMessage("Sign in to keep your progress.");
      return;
    }
    setMessage("Could not update progress.");
  }

  return <div className="progress-box"><div><span className="eyebrow">Your next step</span><strong>Keep the momentum visible.</strong></div><select aria-label="Application progress" value={status} onChange={(event) => void update(event.target.value as ApplicationStatus)}>{choices.map((choice) => <option value={choice.value} key={choice.value}>{choice.label}</option>)}</select>{message && <a href={`/login?next=${encodeURIComponent(`/opportunities/${opportunityId}`)}`} className="progress-message">{message}</a>}</div>;
}
