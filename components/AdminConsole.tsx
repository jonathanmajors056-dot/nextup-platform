"use client";

import { useState } from "react";
import type { Opportunity } from "@/lib/types";

export function AdminConsole({ initialReview }: { initialReview: Opportunity[] }) {
  const [review, setReview] = useState(initialReview);
  const [rawText, setRawText] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setMessage("");
    const response = await fetch("/api/submissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rawText, sourceUrl, sourceType: "manual" }) });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) { setMessage(data.error || "Submission failed."); return; }
    setRawText(""); setSourceUrl("");
    if (data.opportunity) {
      setReview((items) => [data.opportunity, ...items]);
      setMessage("Draft created. Review it below before publishing.");
      return;
    }
    setMessage("Submission queued. The review queue will update when extraction finishes.");
    window.setTimeout(async () => {
      const refresh = await fetch("/api/admin/review");
      if (!refresh.ok) return;
      const next = await refresh.json() as { data?: Opportunity[] };
      if (next.data) setReview(next.data);
    }, 1500);
  }

  async function decide(id: string, action: "publish" | "archive") {
    setBusy(true);
    const response = await fetch(`/api/opportunities/${id}/${action}`, { method: "POST" });
    setBusy(false);
    if (response.ok) setReview((items) => items.filter((item) => item.id !== id));
  }

  return (
    <div className="admin-layout">
      <section className="card form-card">
        <div className="section-heading" style={{ marginTop: 0 }}><div><h2>New opportunity draft</h2><p>Paste a WhatsApp forward or source text. AI will extract a reviewable draft.</p></div></div>
        <form onSubmit={submit} className="form-grid">
          <div className="field-group full"><label htmlFor="rawText">Opportunity message</label><textarea id="rawText" value={rawText} onChange={(event) => setRawText(event.target.value)} placeholder="Paste the complete message, including dates, eligibility, links, prizes, and organizer details…" required /></div>
          <div className="field-group full"><label htmlFor="sourceUrl">Official/source URL (optional)</label><input className="field" id="sourceUrl" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://…" type="url" /></div>
          <div className="field-group full"><button className="button button-primary" disabled={busy}>{busy ? "Processing…" : "Create AI draft"}</button></div>
        </form>
        {message && <p style={{ color: message.includes("failed") ? "var(--red)" : "var(--green)", margin: "14px 0 0", fontSize: 13 }}>{message}</p>}
      </section>
      <section className="card form-card"><div className="section-label">Pilot rules</div><h2>Human approval stays on</h2><p style={{ color: "var(--muted)", lineHeight: 1.6 }}>AI can extract, summarize, classify, and flag missing information. It cannot publish a listing by itself.</p><div className="notice">Demo mode is active until Supabase and an admin key are configured.</div><div className="fact-list"><div className="fact"><span className="fact-icon" /><div><span>Trust</span><strong>Every listing keeps its source</strong></div></div><div className="fact"><span className="fact-icon" /><div><span>Freshness</span><strong>Expired deadlines disappear</strong></div></div><div className="fact"><span className="fact-icon" /><div><span>Speed</span><strong>Drafts become structured in one step</strong></div></div></div></section>
      <section style={{ gridColumn: "1 / -1" }}><div className="section-heading"><div><h2>Review queue</h2><p>{review.length} drafts waiting for a decision</p></div></div><div className="review-list">{review.length ? review.map((item) => <article className="card review-card" key={item.id}><div><div className="card-top"><span className="pill">{item.category}</span><span className="verified" style={{ color: "var(--orange)" }}>{Math.round(item.aiConfidence * 100)}% AI confidence</span></div><h3>{item.title}</h3><p>{item.summary}</p><div className="tags">{item.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div></div><div className="review-actions"><button className="button button-primary" disabled={busy} onClick={() => decide(item.id, "publish")}>Publish</button><button className="button button-danger" disabled={busy} onClick={() => decide(item.id, "archive")}>Archive</button></div></article>) : <div className="card empty">The review queue is clear.</div>}</div></section>
    </div>
  );
}
