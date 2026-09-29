"use client";

import { useState } from "react";

type Agent = { name: string; role: string; color: string; status: "running" | "queued" | "done" };

const workflows = [
  { name: "Launch intelligence brief", meta: "Research → Synthesis → Review", updated: "2m ago", active: true },
  { name: "Customer signal triage", meta: "Ingest → Classify → Route", updated: "1h ago" },
  { name: "Competitive watchtower", meta: "Scan → Compare → Alert", updated: "Yesterday" },
  { name: "Weekly growth loop", meta: "Measure → Diagnose → Act", updated: "Sep 24" },
];

const initialAgents: Agent[] = [
  { name: "Scout", role: "Web research", color: "violet", status: "done" },
  { name: "Atlas", role: "Pattern synthesis", color: "blue", status: "running" },
  { name: "Prism", role: "Fact checker", color: "amber", status: "queued" },
  { name: "Relay", role: "Delivery planner", color: "green", status: "queued" },
];

const Icon = ({ name, size = 16 }: { name: string; size?: number }) => {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "spark") return <svg {...p}><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7" /></svg>;
  if (name === "flow") return <svg {...p}><rect x="3" y="4" width="7" height="6" rx="1.5" /><rect x="14" y="14" width="7" height="6" rx="1.5" /><path d="M10 7h2a3 3 0 0 1 3 3v4M14 17h-2a3 3 0 0 1-3-3v-4" /></svg>;
  if (name === "chart") return <svg {...p}><path d="M4 19V5M4 19h16" /><path d="m7 15 3-4 3 2 5-7" /></svg>;
  if (name === "clock") return <svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></svg>;
  if (name === "settings") return <svg {...p}><circle cx="12" cy="12" r="3.5" /><path d="M19 15.5a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a1.7 1.7 0 0 1 2.4-2.4l.1.1A1.7 1.7 0 0 0 21.4 7H21a1.7 1.7 0 0 1 0-3.4h.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a1.7 1.7 0 0 1-2.4-2.4l.1-.1A1.7 1.7 0 0 0 13 1.4V2a1.7 1.7 0 0 1-3.4 0v-.2a1.7 1.7 0 0 0-2.9 1.2l.1.1a1.7 1.7 0 0 1-2.4 2.4l-.1-.1A1.7 1.7 0 0 0 3 8.6h.2a1.7 1.7 0 0 1 0 3.4H3a1.7 1.7 0 0 0 1.2 2.9l.1-.1a1.7 1.7 0 0 1 2.4 2.4l-.1.1a1.7 1.7 0 0 0 2.9 1.2v-.2a1.7 1.7 0 0 1 3.4 0v.2a1.7 1.7 0 0 0 2.9-1.2l-.1-.1a1.7 1.7 0 0 1 2.4-2.4l.1.1Z" /></svg>;
  if (name === "plus") return <svg {...p}><path d="M12 5v14M5 12h14" /></svg>;
  if (name === "play") return <svg {...p} fill="currentColor" stroke="none"><path d="m8 5 11 7-11 7V5Z" /></svg>;
  if (name === "pause") return <svg {...p} fill="currentColor" stroke="none"><path d="M7 5h3v14H7zm7 0h3v14h-3z" /></svg>;
  if (name === "search") return <svg {...p}><circle cx="10.8" cy="10.8" r="6.6" /><path d="m16 16 4.2 4.2" /></svg>;
  if (name === "dots") return <svg {...p}><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></svg>;
  return <svg {...p}><path d="m5 12 4 4L19 6" /></svg>;
};

export function NexaChat() {
  const [active, setActive] = useState("Launch intelligence brief");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(68);
  const [agents, setAgents] = useState(initialAgents);
  const [toast, setToast] = useState("");

  const runWorkflow = () => {
    if (running) return;
    setRunning(true); setToast("Workflow resumed — agents are coordinating");
    setAgents((items) => items.map((agent, index) => ({ ...agent, status: index === 1 ? "running" : agent.status })));
    let next = progress;
    const timer = window.setInterval(() => { next = Math.min(next + 8, 100); setProgress(next); if (next >= 100) { window.clearInterval(timer); setRunning(false); setAgents((items) => items.map((agent) => ({ ...agent, status: "done" }))); setToast("Run complete — brief is ready for review"); } }, 700);
  };

  return <div className="agent-app">
    <aside className="agent-sidebar">
      <div className="agent-brand"><span className="agent-brand-mark"><Icon name="spark" size={17} /></span><span>nexa<span className="brand-accent">/</span>ops</span></div>
      <button className="new-flow" onClick={() => { setToast("New workflow draft created"); setActive("Untitled workflow"); }}><Icon name="plus" size={15} /> New workflow <span>⌘ N</span></button>
      <div className="agent-label">Control room</div>
      <nav className="agent-nav"><button className="active"><Icon name="flow" /> Workflows <b>4</b></button><button><Icon name="chart" /> Observability</button><button><Icon name="clock" /> Run history</button></nav>
      <div className="agent-label flows-label">Your workflows</div>
      <div className="flow-list">{workflows.map((item) => <button key={item.name} className={`flow-item ${active === item.name ? "selected" : ""}`} onClick={() => setActive(item.name)}><span className="flow-item-icon"><Icon name="flow" size={14} /></span><span><strong>{item.name}</strong><small>{item.meta}</small></span><em>{item.updated}</em></button>)}</div>
      <div className="agent-sidebar-bottom"><div className="network-status"><span className="status-dot" /> Agent network <strong>Operational</strong><small>12 agents · 3 tools connected</small></div><button className="profile-row"><span className="profile-avatar">AK</span><span><strong>Akash Kulkarni</strong><small>Personal workspace</small></span><Icon name="dots" size={15} /></button></div>
    </aside>
    <main className="agent-main">
      <header className="agent-topbar"><div className="agent-breadcrumb"><span>Workspace</span><b>/</b><strong>{active}</strong></div><div className="top-actions"><span className="top-live"><i /> Live network</span><button aria-label="Search"><Icon name="search" size={17} /></button><button className="help-btn">?</button><span className="profile-avatar small">AK</span></div></header>
      <div className="agent-content">
        <div className="agent-heading"><div><p className="agent-overline">WORKFLOW ORCHESTRATOR <span>•</span> UPDATED 2M AGO</p><h1>{active}</h1><p className="agent-subtitle">A coordinated research loop that turns scattered signals into a decision-ready brief.</p></div><div className="heading-actions"><button className="ghost-btn"><Icon name="dots" size={17} /></button><button className="run-btn" onClick={runWorkflow}>{running ? <><Icon name="pause" size={13} /> Running</> : <><Icon name="play" size={12} /> Run workflow</>}</button></div></div>
        {toast && <div className="toast"><span><Icon name="check" size={14} /></span>{toast}<button onClick={() => setToast("")}>Dismiss</button></div>}
        <section className="run-card"><div className="run-card-head"><div><div className="eyebrow-row"><span className="live-chip"><i /> {running ? "RUNNING NOW" : progress >= 100 ? "COMPLETED" : "PAUSED"}</span><span className="run-id">run_8f2c1d · started 09:41</span></div><h2>Q4 positioning signals</h2><p>Find the 5 strongest shifts in the market and recommend what the team should do next.</p></div><div className="completion"><strong>{progress}%</strong><span>complete</span></div></div><div className="progress-track"><i style={{ width: `${progress}%` }} /></div><div className="run-footer"><span><b>4</b> agents</span><span><b>18</b> sources</span><span><b>02:14</b> elapsed</span><button>View run details <span>↗</span></button></div></section>
        <div className="workspace-grid"><section className="panel agent-panel"><div className="panel-head"><div><p className="panel-kicker">AGENT SWARM</p><h2>Coordination graph</h2></div><button className="panel-icon"><Icon name="settings" size={15} /></button></div><div className="agent-graph"><div className="graph-lines"><span /><span /><span /></div><div className="graph-center"><Icon name="spark" size={18} /><strong>Orchestrator</strong><small>routing tasks</small></div>{agents.map((agent, index) => <div key={agent.name} className={`agent-node node-${index}`}><span className={`node-avatar ${agent.color}`}><Icon name={index === 0 ? "search" : index === 1 ? "spark" : index === 2 ? "check" : "flow"} size={14} /></span><span><strong>{agent.name}</strong><small>{agent.status === "running" ? "Working now" : agent.status === "done" ? "Completed" : "Queued"}</small></span><i className={agent.status} /></div>)}</div><div className="agent-legend"><span><i className="running" /> Working</span><span><i className="done" /> Done</span><span><i className="queued" /> Queued</span></div></section>
          <section className="panel trace-panel"><div className="panel-head"><div><p className="panel-kicker">LIVE TRACE</p><h2>What’s happening</h2></div><span className="trace-count">{running ? "streaming" : "just now"}</span></div><div className="trace-list"><div className="trace-item"><span className="trace-icon violet"><Icon name="search" size={14} /></span><div><strong>Scout found 18 relevant sources</strong><small>news, filings, and competitor pages</small></div><time>09:42:18</time></div><div className="trace-item active-trace"><span className="trace-icon blue"><Icon name="spark" size={14} /></span><div><strong>Atlas is clustering the signals</strong><small>3 themes identified · confidence 0.86</small></div><time>09:42:31</time></div><div className="trace-item"><span className="trace-icon amber"><Icon name="clock" size={14} /></span><div><strong>Prism is waiting for Atlas</strong><small>next: verify claims against sources</small></div><time>09:42:34</time></div><div className="trace-item"><span className="trace-icon green"><Icon name="check" size={14} /></span><div><strong>Checkpoint saved</strong><small>safe to pause and resume later</small></div><time>09:42:35</time></div></div><button className="trace-link">Open full event log <span>↗</span></button></section></div>
        <div className="bottom-grid"><section className="panel output-panel"><div className="panel-head"><div><p className="panel-kicker">OUTPUT PREVIEW</p><h2>Decision brief</h2></div><span className="ready-tag">Draft ready</span></div><div className="output-preview"><div className="output-title"><span className="doc-icon">✦</span><div><strong>Q4 positioning signals</strong><small>Generated by Atlas · 2 min ago</small></div><button>Open</button></div><p>Three shifts are shaping the category: buyers are consolidating tools, implementation speed is becoming a differentiator, and trust signals are moving closer to the product surface.</p><div className="output-tags"><span>3 themes</span><span>8 citations</span><span>Confidence 86%</span></div></div></section><section className="panel metrics-panel"><div className="panel-head"><div><p className="panel-kicker">RUN HEALTH</p><h2>System telemetry</h2></div></div><div className="metric-row"><span>Agent success rate</span><strong>98.4%</strong><i><b style={{ width: "98%" }} /></i></div><div className="metric-row"><span>Average run time</span><strong>04:21</strong><i><b style={{ width: "61%" }} /></i></div><div className="metric-row"><span>Cost per run</span><strong>$0.18</strong><i><b style={{ width: "34%" }} /></i></div><div className="metric-foot"><span><i className="status-dot" /> All systems nominal</span><button>View metrics ↗</button></div></section></div>
      </div>
    </main>
  </div>;
}
