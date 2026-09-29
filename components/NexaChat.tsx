"use client";

import { FormEvent, useMemo, useState } from "react";

type Message = { role: "user" | "assistant"; text: string; code?: string; sources?: string[]; time?: string };

const initialMessages: Message[] = [
  {
    role: "assistant",
    text: "Hi, I’m Nexa. I can explain ideas, write and debug code, and help you turn a rough thought into a clear next step. What are you working on today?",
    sources: ["Nexa knowledge engine", "Live verification ready"],
    time: "Just now",
  },
];

const promptCards = [
  { icon: "✦", title: "Explain something", prompt: "Explain quantum computing like I’m smart but new to it." },
  { icon: "⌘", title: "Build with code", prompt: "Build a clean React component for a responsive pricing table." },
  { icon: "↗", title: "Plan a project", prompt: "Help me plan a focused 30-day launch for a side project." },
  { icon: "◎", title: "Think it through", prompt: "Help me compare two options and make a practical decision." },
];

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "spark") return <svg {...common}><path d="m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2Z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" /></svg>;
  if (name === "chat") return <svg {...common}><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.5 8.5 0 0 1-3.4-.7L4 20l1.5-3.7A7.5 7.5 0 1 1 20 11.5Z" /></svg>;
  if (name === "code") return <svg {...common}><path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14" /></svg>;
  if (name === "grid") return <svg {...common}><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></svg>;
  if (name === "clock") return <svg {...common}><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></svg>;
  if (name === "search") return <svg {...common}><circle cx="10.8" cy="10.8" r="6.6" /><path d="m16 16 4.2 4.2" /></svg>;
  if (name === "plus") return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
  if (name === "send") return <svg {...common}><path d="m21 3-7.2 18-3.6-7.2L3 10.2 21 3Z" /><path d="m10.2 13.8 4.5-4.5" /></svg>;
  if (name === "copy") return <svg {...common}><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>;
  if (name === "check") return <svg {...common}><path d="m5 12 4.2 4.2L19 6.8" /></svg>;
  if (name === "menu") return <svg {...common}><path d="M4 6h16M4 12h16M4 18h16" /></svg>;
  return <svg {...common}><circle cx="12" cy="12" r="8" /></svg>;
}

function makeReply(prompt: string): Message {
  const lower = prompt.toLowerCase();
  if (lower.includes("react") || lower.includes("component") || lower.includes("code") || lower.includes("javascript")) {
    return { role: "assistant", text: "Here’s a small, accessible starting point. It keeps the component focused, works on mobile, and is easy to extend with your own data.", code: `export function FeatureCard({ title, body, href }) {\n  return (\n    <a className="feature-card" href={href}>\n      <span className="feature-card__eyebrow">NEXA LABS</span>\n      <h3>{title}</h3>\n      <p>{body}</p>\n      <span className="feature-card__link">Explore →</span>\n    </a>\n  );\n}` , sources: ["React patterns", "Accessibility checklist"], time: "Just now" };
  }
  if (lower.includes("compare") || lower.includes("decision")) {
    return { role: "assistant", text: "A useful way to make this decision is to score each option against the thing you’ll actually optimize for: speed, upside, cost, and reversibility. Start with the choice that keeps learning fast and downside contained.", sources: ["Decision framework", "Assumption check"], time: "Just now" };
  }
  return { role: "assistant", text: "Here’s a clear way to think about it: define the outcome first, separate facts from assumptions, then choose the smallest next action that gives you new information. If you share your constraints, I can make this specific to your situation.", sources: ["Nexa knowledge engine", "Reasoning pass"], time: "Just now" };
}

export function NexaChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("Nexa");
  const [activeChat, setActiveChat] = useState("Launch plan for Nexa");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const chatItems = useMemo(() => ["Launch plan for Nexa", "React dashboard review", "Learning roadmap", "Product positioning notes"], []);

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    const clean = input.trim();
    if (!clean || loading) return;
    setMessages((current) => [...current, { role: "user", text: clean, time: "Just now" }]);
    setInput("");
    setLoading(true);
    window.setTimeout(() => {
      setMessages((current) => [...current, makeReply(clean)]);
      setLoading(false);
    }, 650);
  };

  const startNew = () => { setActiveChat("New conversation"); setMessages(initialMessages); setInput(""); setSidebarOpen(false); };

  return (
    <div className="nexa-app">
      <aside className={`nexa-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="nexa-brand"><span className="nexa-logo"><Icon name="spark" size={17} /></span><span>Nexa<span className="nexa-brand-dot">.</span>ai</span></div>
        <button className="nexa-new-chat" onClick={startNew}><Icon name="plus" size={17} /> New conversation <kbd>⌘ K</kbd></button>
        <div className="nexa-sidebar-label">Workspace</div>
        <nav className="nexa-nav" aria-label="Workspace navigation">
          <button className="nexa-nav-item active"><Icon name="chat" /> Chat <span>⌁</span></button>
          <button className="nexa-nav-item"><Icon name="grid" /> Explore <span>↗</span></button>
          <button className="nexa-nav-item"><Icon name="code" /> Code studio <span>⌘</span></button>
        </nav>
        <div className="nexa-sidebar-label history-label">Recent chats</div>
        <div className="nexa-chat-list">{chatItems.map((chat) => <button key={chat} className={`nexa-chat-item ${activeChat === chat ? "selected" : ""}`} onClick={() => { setActiveChat(chat); setSidebarOpen(false); }}>{chat}</button>)}</div>
        <div className="nexa-sidebar-bottom"><div className="nexa-privacy"><span className="nexa-status" /> Your chats stay private <span>·</span> Free plan</div><button className="nexa-profile"><span className="nexa-avatar">AK</span><span><strong>Akash Kulkarni</strong><small>Personal workspace</small></span><span className="nexa-more">•••</span></button></div>
      </aside>

      <main className="nexa-main">
        <header className="nexa-topbar"><button className="nexa-mobile-menu" onClick={() => setSidebarOpen((value) => !value)} aria-label="Toggle menu"><Icon name="menu" /></button><div className="nexa-crumb"><span>Workspace</span><b>/</b><strong>{activeChat}</strong></div><div className="nexa-top-actions"><span className="nexa-live"><i /> All systems operational</span><button className="nexa-icon-btn" aria-label="Search"><Icon name="search" size={19} /></button><button className="nexa-help">?</button><span className="nexa-avatar small">AK</span></div></header>
        <section className="nexa-content">
          <div className="nexa-welcome"><div><p className="nexa-overline">SATURDAY, 26 SEPTEMBER 2026</p><h1>What will we <em>make</em> today?</h1><p className="nexa-subtitle">A thoughtful AI workspace for clear answers, better code, and forward motion.</p></div><div className="nexa-trust"><Icon name="check" size={15} /><span><strong>Answer quality mode</strong><small>Grounded · structured · transparent</small></span></div></div>
          <div className="nexa-modebar"><div className="nexa-mode-tabs" role="tablist" aria-label="Assistant mode">{["Nexa", "Code", "Research"].map((item) => <button key={item} className={mode === item ? "active" : ""} onClick={() => setMode(item)}>{item === "Nexa" ? <Icon name="spark" size={14} /> : item === "Code" ? <Icon name="code" size={14} /> : <Icon name="search" size={14} />}{item}</button>)}</div><span className="nexa-model">Nexa 2.0 <b>⌄</b></span></div>
          <div className="nexa-chat-window">
            <div className="nexa-message-stack">{messages.map((message, index) => <article key={`${message.role}-${index}`} className={`nexa-message ${message.role}`}><div className={`nexa-message-avatar ${message.role}`}>{message.role === "assistant" ? <Icon name="spark" size={16} /> : "AK"}</div><div className="nexa-message-body"><div className="nexa-message-meta"><strong>{message.role === "assistant" ? "Nexa" : "You"}</strong><span>{message.time}</span></div><p>{message.text}</p>{message.code && <div className="nexa-code"><div className="nexa-code-head"><span><i /> <i /> <i /></span><small>FeatureCard.jsx</small><button onClick={() => { navigator.clipboard?.writeText(message.code ?? ""); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }}>{copied ? <><Icon name="check" size={13} /> Copied</> : <><Icon name="copy" size={13} /> Copy</>}</button></div><pre><code>{message.code}</code></pre></div>}{message.sources && <div className="nexa-sources">{message.sources.map((source) => <span key={source}><Icon name="check" size={12} /> {source}</span>)}</div>}</div></article>)}{loading && <article className="nexa-message assistant"><div className="nexa-message-avatar assistant"><Icon name="spark" size={16} /></div><div className="nexa-message-body"><div className="nexa-message-meta"><strong>Nexa</strong><span>Thinking</span></div><div className="nexa-thinking"><i /><i /><i /></div></div></article>}</div>
            {messages.length === 1 && <div className="nexa-starters">{promptCards.map((card) => <button key={card.title} onClick={() => setInput(card.prompt)}><span>{card.icon}</span><strong>{card.title}</strong><small>{card.prompt}</small><b>↗</b></button>)}</div>}
            <form className="nexa-composer" onSubmit={submit}><div className="nexa-composer-top"><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); } }} placeholder={`Ask ${mode} anything…`} rows={1} aria-label="Message Nexa" /><button className="nexa-send" type="submit" aria-label="Send message"><Icon name="send" size={17} /></button></div><div className="nexa-composer-bottom"><div><button type="button"><span>＋</span> Attach</button><button type="button"><span>◒</span> Think deeper</button></div><span>Enter to send <b>·</b> Shift + Enter for new line</span></div></form>
          </div>
          <p className="nexa-disclaimer">Nexa can make mistakes. Check important information and verify code before shipping.</p>
        </section>
      </main>
    </div>
  );
}
