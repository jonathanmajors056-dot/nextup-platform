import type { ReadinessItem } from "@/lib/launch-readiness";

export function LaunchReadiness({ readiness }: { readiness: ReturnType<typeof import("@/lib/launch-readiness").getLaunchReadiness> }) {
  return <section className="card form-card readiness-panel" aria-labelledby="launch-readiness-title">
    <div className="section-heading" style={{ marginTop: 0 }}>
      <div><span className="section-label">Launch control</span><h2 id="launch-readiness-title">Readiness, without guesswork</h2><p>Configuration status is evaluated on the server. Secret values are never displayed.</p></div>
      <span className={`pill ${readiness.pilotReady ? "green" : "orange"}`}>{readiness.pilotReady ? "Pilot ready" : "Pilot setup needed"}</span>
    </div>
    <div className="readiness-grid">
      {readiness.items.map((item: ReadinessItem) => <div className="readiness-item" key={item.id}>
        <div className={`readiness-mark ${item.configured ? "ready" : "pending"}`} aria-hidden="true">{item.configured ? "✓" : "!"}</div>
        <div><strong>{item.label}</strong><small>{item.detail}</small></div>
        <span className={`provider-status ${item.configured ? "configured" : item.requiredFor === "optional" ? "disabled" : "needs_configuration"}`}>{item.configured ? "ready" : item.requiredFor === "optional" ? "optional" : "needed"}</span>
      </div>)}
    </div>
    {!readiness.publicReady && <div className="readiness-callout"><strong>Current launch decision:</strong> NextUp can operate as a controlled pilot. Public live-feed launch waits on the items marked needed, plus a real authentication provider and a completed production schema check.</div>}
  </section>;
}
