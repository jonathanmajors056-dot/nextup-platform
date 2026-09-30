"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Opportunity } from "@/lib/types";
import { categories } from "@/lib/types";
import { SaveButton } from "./SaveButton";
import { LocationPreferences } from "./LocationPreferences";
import type { LocationPreference } from "@/lib/types";
import { OpportunityMap } from "./OpportunityMap";

function daysLeft(value: string | null) {
  if (!value) return null;
  return Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / 86400000));
}

function dateLabel(value: string | null) {
  if (!value) return "Open deadline";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(value));
}

function statusLabel(item: Opportunity) {
  return item.verificationStatus === "officially_verified" ? "Verified" : "Community reviewed";
}

function OpportunityRow({ item, compact = false }: { item: Opportunity; compact?: boolean }) {
  const days = daysLeft(item.registrationDeadline);
  return (
    <Link className={`dashboard-row ${compact ? "compact" : ""}`} href={`/opportunities/${item.id}`} data-opportunity-card tabIndex={0}>
      <span className="row-icon">{item.category.slice(0, 1)}</span>
      <span className="row-main"><strong>{item.title}</strong><small>{item.organizer} · {item.format} · {statusLabel(item)}{item.distanceKm != null ? ` · ${item.distanceKm} km away` : ""}</small></span>
      <span className={`row-deadline ${days !== null && days <= 7 ? "urgent" : ""}`}><strong>{days === null ? "Open" : `${days}d`}</strong><small>{dateLabel(item.registrationDeadline)}</small></span>
      {!compact && <span className="row-arrow">↗</span>}
    </Link>
  );
}

export function OpportunityDashboard({ opportunities, savedIds, locationPreference, mapsEnabled }: { opportunities: Opportunity[]; savedIds: string[]; locationPreference: LocationPreference | null; mapsEnabled: boolean }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [format, setFormat] = useState("All");
  const [keys, setKeys] = useState<string[]>([]);
  const keySequenceRef = useRef<string[]>([]);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return opportunities.filter((item) => {
      const haystack = [item.title, item.organizer, item.summary, item.description, ...item.tags, ...item.skills].join(" ").toLowerCase();
      return (!q || haystack.includes(q)) && (category === "All" || item.category === category) && (format === "All" || item.format === format);
    });
  }, [category, format, opportunities, query]);
  const saved = opportunities.filter((item) => savedIds.includes(item.id));
  const urgent = [...opportunities].filter((item) => { const days = daysLeft(item.registrationDeadline); return days !== null && days <= 14; }).sort((a, b) => (daysLeft(a.registrationDeadline) ?? 99) - (daysLeft(b.registrationDeadline) ?? 99));
  const verified = opportunities.filter((item) => item.verificationStatus === "officially_verified").length;
  const newThisWeek = opportunities.filter((item) => Date.now() - new Date(item.createdAt).getTime() <= 7 * 86400000).length;
  const categoryCounts = categories.map((name) => ({ name, count: opportunities.filter((item) => item.category === name).length })).filter((item) => item.count > 0);
  const spotlight = [...opportunities].sort((a, b) => (daysLeft(a.registrationDeadline) ?? 999) - (daysLeft(b.registrationDeadline) ?? 999))[0];

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if (event.key === "/" && !isTyping) { event.preventDefault(); searchRef.current?.focus(); return; }
      if (isTyping) return;
      if (event.key === "?") { event.preventDefault(); setShowShortcuts(true); return; }
      if (event.key === "Escape") { setShowShortcuts(false); return; }
      if (event.key.toLowerCase() === "g") { keySequenceRef.current = ["g"]; setKeys(["g"]); window.setTimeout(() => { keySequenceRef.current = []; setKeys([]); }, 1200); return; }
      if (keySequenceRef.current[0] === "g" && event.key.toLowerCase() === "h") { window.location.href = "/"; return; }
      if (keySequenceRef.current[0] === "g" && event.key.toLowerCase() === "s") { window.location.href = "/saved"; return; }
      if (keySequenceRef.current[0] === "g" && event.key.toLowerCase() === "a") { window.location.href = "/admin"; return; }
      if (["j", "k", "ArrowDown", "ArrowUp"].includes(event.key)) {
        event.preventDefault();
        const cards = Array.from(document.querySelectorAll<HTMLElement>("#discover [data-opportunity-card]"));
        const current = cards.indexOf(document.activeElement as HTMLElement);
        const direction = event.key === "j" || event.key === "ArrowDown" ? 1 : -1;
        cards[Math.min(cards.length - 1, Math.max(0, current + direction))]?.focus();
        return;
      }
      if (event.key === "Enter" && document.activeElement instanceof HTMLElement && document.activeElement.matches("[data-opportunity-card]")) { event.preventDefault(); document.activeElement.click(); }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [keys]);

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar" aria-label="Dashboard navigation">
        <div className="sidebar-label">Workspace</div>
        <Link href="/" className="sidebar-link active"><span>⌂</span>Overview <kbd>gh</kbd></Link>
        <Link href="#discover" className="sidebar-link"><span>⌕</span>Discover <kbd>/</kbd></Link>
        <Link href="/saved" className="sidebar-link"><span>♡</span>Saved <kbd>gs</kbd></Link>
        <Link href="/admin" className="sidebar-link"><span>✦</span>Admin</Link>
        <button className="sidebar-link sidebar-button" type="button" onClick={() => setShowShortcuts(true)}><span>?</span>Shortcuts <kbd>?</kbd></button>
        <div className="sidebar-bottom"><div className="sidebar-label">Pilot network</div><div className="network-card"><span className="network-dot" />Institution workspace<strong>India · Student opportunities</strong></div></div>
      </aside>
      <section className="dashboard-content">
        <div className="dashboard-topline"><div><span className="eyebrow">Your opportunity desk · Today</span><h1>Your next opportunity is already moving.</h1><p>Good morning, builder. Here’s what is worth your attention today.</p></div><div className="keyboard-hint"><span>Navigate</span><kbd>J</kbd><kbd>K</kbd><span>Search</span><kbd>/</kbd><button className="shortcut-trigger" type="button" onClick={() => setShowShortcuts(true)} aria-label="Open keyboard shortcuts">?</button></div></div>
        <section className="command-hero" aria-label="Opportunity signal overview">
          <div className="command-copy"><span className="eyebrow">From scattered messages to useful signal</span><h2>See the right opportunities before the deadline does.</h2><p>NextUp turns noisy forwards and official sources into a focused, trusted action list for your next move.</p><div className="quick-actions"><a className="button button-light" href="#discover">Explore all <span>⌘1</span></a><a className="button button-quiet" href="#radar">Closing soon <span>{urgent.length}</span></a><Link className="button button-quiet" href="/saved">Saved <span>{saved.length}</span></Link><Link className="button button-quiet" href="/admin">Submit opportunity</Link></div></div>
          <div className="signal-visual" role="img" aria-label="Signals from sources are organized into a clear opportunity feed"><svg viewBox="0 0 360 210" aria-hidden="true"><defs><linearGradient id="signalGlow" x1="0" x2="1"><stop offset="0" stopColor="#75a8ff" stopOpacity=".25" /><stop offset="1" stopColor="#ff8a65" stopOpacity=".8" /></linearGradient></defs><path className="signal-path" d="M20 154 C85 154 78 82 137 90 S184 164 230 126 S274 55 338 58" fill="none" stroke="url(#signalGlow)" strokeWidth="3" /><path className="signal-path faint" d="M20 175 C88 175 92 122 142 126 S190 188 240 151 S290 94 338 98" fill="none" stroke="#8bb5ff" strokeOpacity=".42" strokeWidth="2" /><circle className="signal-node" cx="20" cy="154" r="6" /><circle className="signal-node" cx="137" cy="90" r="7" /><circle className="signal-node" cx="230" cy="126" r="7" /><circle className="signal-node hot" cx="338" cy="58" r="9" /><circle className="signal-orbit" cx="230" cy="126" r="28" fill="none" stroke="#9fc0ff" strokeOpacity=".45" /><text x="15" y="198">sources</text><text x="115" y="67">AI signal</text><text x="273" y="38">action</text></svg></div>
        </section>
        <LocationPreferences initial={locationPreference} />
        <OpportunityMap opportunities={opportunities} locationPreference={locationPreference} mapsEnabled={mapsEnabled} />
        <div className="dashboard-stats">
          <div className="stat-card"><span>Live right now</span><strong>{opportunities.length}</strong><small>published opportunities</small></div>
          <div className="stat-card accent"><span>Closing soon</span><strong>{urgent.length}</strong><small>within the next 14 days</small></div>
          <div className="stat-card"><span>New this week</span><strong>{newThisWeek}</strong><small>fresh signals added</small></div>
          <div className="stat-card"><span>Verified sources</span><strong>{verified}</strong><small>officially checked</small></div>
        </div>
        <section className="trust-strip" aria-label="How NextUp keeps listings useful">
          <div><span className="trust-icon">✓</span><span><strong>Human approved</strong><small>Every listing is reviewed before publishing.</small></span></div>
          <div><span className="trust-icon">↗</span><span><strong>Source preserved</strong><small>Open the organizer’s official page anytime.</small></span></div>
          <div><span className="trust-icon">◷</span><span><strong>Deadline aware</strong><small>Expired opportunities leave the live feed.</small></span></div>
        </section>
        <div className="dashboard-spotlight-grid">
          <section className="spotlight-card">
            <div className="spotlight-head"><div><span className="eyebrow">Spotlight opportunity</span><h2>{spotlight?.title ?? "Your next opportunity"}</h2></div><span className="spotlight-mark">↗</span></div>
            <p>{spotlight?.summary ?? "Your curated opportunity feed will appear here."}</p>
            {spotlight && <div className="spotlight-bottom"><div><span>Deadline</span><strong>{dateLabel(spotlight.registrationDeadline)}</strong></div><div><span>Format</span><strong>{spotlight.format} · {spotlight.location}</strong></div><div><span>Benefit</span><strong>{spotlight.benefit || "See source"}</strong></div><div className="spotlight-actions"><Link className="button button-light" href={`/opportunities/${spotlight.id}`}>View opportunity</Link><a className="button button-quiet" href={spotlight.officialUrl} target="_blank" rel="noreferrer">Official source ↗</a><SaveButton opportunityId={spotlight.id} initialSaved={savedIds.includes(spotlight.id)} /></div></div>}
          </section>
          <section className="radar-card" id="radar"><div className="section-heading"><div><span className="eyebrow">Deadline radar</span><h2>Don’t miss the window</h2></div><span className="radar-count">{urgent.length}</span></div><div className="radar-timeline" role="list" aria-label="Upcoming opportunity deadlines">{urgent.slice(0, 4).map((item) => { const days = daysLeft(item.registrationDeadline) ?? 0; return <Link className={`radar-row ${days <= 3 ? "danger" : days <= 7 ? "warning" : "safe"}`} href={`/opportunities/${item.id}`} key={item.id} role="listitem"><span className="radar-bar"><i style={{ width: `${Math.max(10, Math.min(100, 100 - days * 4))}%` }} /></span><span><strong>{item.title}</strong><small>{days === 0 ? "Closes today" : `${days} days left`} · {item.category}</small></span><b>{dateLabel(item.registrationDeadline)}</b></Link>; })}{urgent.length === 0 && <p className="muted-copy">No urgent deadlines. Your feed is clear.</p>}</div></section>
        </div>
        <section className="category-pulse panel-card" aria-label="Opportunity categories"><div className="section-heading"><div><span className="eyebrow">Category pulse</span><h2>Where the signal is</h2></div><span className="result-count">{categoryCounts.length} active categories</span></div><div className="category-bars">{categoryCounts.length ? categoryCounts.map((item, index) => <button className={`category-bar category-${index % 5}`} type="button" key={item.name} onClick={() => { setCategory(item.name); document.getElementById("discover")?.scrollIntoView({ behavior: "smooth" }); }}><span className="category-bar-label"><strong>{item.name}</strong><small>{item.count} {item.count === 1 ? "opportunity" : "opportunities"}</small></span><span className="category-track"><i style={{ width: `${Math.max(12, (item.count / Math.max(...categoryCounts.map((category) => category.count))) * 100)}%` }} /></span><span className="category-arrow">→</span></button>) : <p className="muted-copy">Categories will appear as opportunities are approved.</p>}</div></section>
        <section id="discover" className="discover-section"><div className="section-heading"><div><span className="eyebrow">The opportunity stream</span><h2>Explore what’s moving</h2></div><span className="result-count" aria-live="polite">{filtered.length} results</span></div><div className="dashboard-filters"><div className="search"><input id="opportunity-search" ref={searchRef} aria-label="Search opportunities" placeholder="Search by skill, event, organizer…" value={query} onChange={(event) => setQuery(event.target.value)} /></div><select className="select" aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)}><option>All</option>{categories.map((item) => <option key={item}>{item}</option>)}</select><select className="select" aria-label="Filter by format" value={format} onChange={(event) => setFormat(event.target.value)}><option>All</option><option>online</option><option>offline</option><option>hybrid</option></select></div><div className="dashboard-list">{filtered.length ? filtered.map((item) => <OpportunityRow item={item} key={item.id} />) : <div className="card empty">No opportunities match those filters yet.</div>}</div></section>
        <div className="dashboard-bottom-grid"><section className="panel-card"><div className="section-heading"><div><span className="eyebrow">Recently added</span><h2>Fresh signal</h2></div><Link href="#discover" className="text-link">View all →</Link></div><div className="compact-list">{opportunities.slice(0, 3).map((item) => <OpportunityRow item={item} compact key={item.id} />)}</div></section><section className="panel-card"><div className="section-heading"><div><span className="eyebrow">Your shortlist</span><h2>Saved for later</h2></div><Link href="/saved" className="text-link">Open saved →</Link></div>{saved.length ? <div className="compact-list">{saved.slice(0, 3).map((item) => <OpportunityRow item={item} compact key={item.id} />)}</div> : <div className="mini-empty"><span>♡</span><strong>Build your shortlist</strong><p>Save opportunities when you want to come back with focus.</p></div>}</section></div>
        <p className="footer">NextUp pilot · every opportunity keeps its source, deadline, and review state.</p>
      </section>
      {showShortcuts && <div className="shortcuts-backdrop" role="presentation" onClick={() => setShowShortcuts(false)}><div className="shortcuts-dialog" role="dialog" aria-modal="true" aria-labelledby="shortcuts-title" onClick={(event) => event.stopPropagation()}><div className="dialog-head"><div><span className="eyebrow">Keyboard-first navigation</span><h2 id="shortcuts-title">Move through the signal</h2></div><button className="dialog-close" type="button" onClick={() => setShowShortcuts(false)} aria-label="Close keyboard shortcuts">×</button></div><div className="shortcut-list"><div><kbd>/</kbd><span>Focus search</span></div><div><kbd>J</kbd><kbd>K</kbd><span>Move through opportunities</span></div><div><kbd>Enter</kbd><span>Open focused opportunity</span></div><div><kbd>G</kbd><kbd>H</kbd><span>Go home</span></div><div><kbd>G</kbd><kbd>S</kbd><span>Open saved</span></div><div><kbd>G</kbd><kbd>A</kbd><span>Open admin</span></div><div><kbd>?</kbd><span>Open this help</span></div><div><kbd>Esc</kbd><span>Close overlays</span></div></div></div></div>}
    </div>
  );
}
