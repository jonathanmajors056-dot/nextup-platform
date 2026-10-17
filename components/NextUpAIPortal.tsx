"use client";

import { useState } from "react";

type Provider = {
  name: string;
  model: string;
  state: "ready" | "cooldown";
  failures: number;
  lastError?: string;
  retryAt: string | null;
};

type AIStatus = {
  portal: string;
  configuredCount: number;
  fallbackReady: boolean;
  order: string[];
  providers: Provider[];
};

type Draft = {
  title: string;
  summary: string;
  category: string;
  organizer: string;
  registrationDeadline: string | null;
  aiConfidence: number;
  tags: string[];
};

const providerLabels: Record<string, string> = {
  groq: "Groq",
  gemini: "Gemini",
  openrouter: "OpenRouter",
  huggingface: "Hugging Face",
  openai: "OpenAI",
};

export function NextUpAIPortal({ initialStatus }: { initialStatus: AIStatus }) {
  const [status, setStatus] = useState(initialStatus);
  const [rawText, setRawText] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function refreshStatus() {
    const response = await fetch("/api/ai/status", { cache: "no-store" });
    if (!response.ok) throw new Error("Status refresh failed");
    setStatus(await response.json() as AIStatus);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setDraft(null);
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText, sourceType: "manual", sourceUrl: "" }),
      });
      const payload = await response.json() as { opportunity?: Draft; error?: string };
      if (!response.ok || !payload.opportunity) throw new Error(payload.error || "Extraction failed");
      setDraft(payload.opportunity);
      setRawText("");
      await refreshStatus();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The fallback chain could not complete this request.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="main ai-portal-main">
    <section className="ai-hero">
      <div>
        <span className="eyebrow">NextUp AI · resilient opportunity intelligence</span>
        <h1>Turn noisy forwards into your next move.</h1>
        <p className="hero-copy">Paste an opportunity message and NextUp AI structures the title, deadline, eligibility, and action points for review. Four providers stand behind the same request so one outage does not stop your workflow.</p>
        <div className="ai-hero-actions"><a className="button button-primary" href="#extract">Extract an opportunity ↓</a><a className="button button-secondary" href="/">Browse Discover</a></div>
      </div>
      <aside className="ai-orbit-card"><div className="ai-orbit-mark">✦</div><span className="eyebrow">Fallback mesh</span><strong>{status.configuredCount} providers ready</strong><p>{status.order.map((name) => providerLabels[name] || name).join(" → ")}</p><small>Provider secrets stay server-side. Every generated draft still requires review.</small></aside>
    </section>

    <section className="ai-stat-grid" aria-label="AI portal status">
      <div className="ai-stat"><span>Active providers</span><strong>{status.configuredCount}</strong><small>Configured locally</small></div>
      <div className="ai-stat"><span>Routing policy</span><strong>Sequential</strong><small>Next provider on failure</small></div>
      <div className="ai-stat"><span>Safety state</span><strong>Review-first</strong><small>Nothing auto-publishes</small></div>
    </section>

    <section className="ai-workspace" id="extract">
      <div className="ai-panel ai-extract-panel">
        <div className="section-heading"><div><span className="eyebrow">AI extraction desk</span><h2>Give the signal some shape.</h2></div><span className="pill green">{status.fallbackReady ? "Fallback active" : "Manual mode"}</span></div>
        <form onSubmit={submit}>
          <label className="ai-label" htmlFor="ai-message">Opportunity message</label>
          <textarea id="ai-message" className="ai-textarea" value={rawText} onChange={(event) => setRawText(event.target.value)} minLength={20} required placeholder="Paste a WhatsApp forward, event announcement, scholarship notice, or internship message…" />
          <div className="ai-form-footer"><span>{rawText.length} characters · drafts are sent for review</span><button className="button button-primary" disabled={loading}>{loading ? "Routing through AI…" : "Extract structured draft"}</button></div>
        </form>
        {message && <p className="ai-error" role="alert">{message}</p>}
        {draft && <article className="ai-result" aria-live="polite"><div className="card-top"><span className="pill">{draft.category}</span><span className="verified">AI confidence {Math.round(draft.aiConfidence * 100)}%</span></div><h3>{draft.title}</h3><p>{draft.summary}</p><div className="ai-result-grid"><span><b>Organizer</b>{draft.organizer || "Needs verification"}</span><span><b>Deadline</b>{draft.registrationDeadline || "Needs verification"}</span></div><div className="tags">{draft.tags?.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div></article>}
      </div>

      <aside className="ai-panel ai-providers-panel"><div className="section-heading"><div><span className="eyebrow">Provider mesh</span><h2>Quietly resilient.</h2></div><button className="icon-button" type="button" onClick={() => void refreshStatus()} aria-label="Refresh provider status">↻</button></div><p className="ai-panel-copy">NextUp tries each configured provider in order. A failing provider enters a short cooldown, while the next request continues down the chain.</p><div className="provider-list">{status.providers.map((provider, index) => <div className="provider-row" key={provider.name}><span className={`provider-index ${provider.state === "ready" ? "ready" : "cooldown"}`}>{index + 1}</span><div><strong>{providerLabels[provider.name] || provider.name}</strong><small>{provider.model}</small></div><span className={`provider-state ${provider.state}`}>{provider.state === "ready" ? "Ready" : "Cooling down"}</span></div>)}</div></aside>
    </section>
  </main>;
}
