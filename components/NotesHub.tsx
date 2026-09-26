"use client";

import { useMemo, useState } from "react";

type Subject = {
  code: string;
  name: string;
  branch: string;
  accent: string;
  topics: number;
  type: string;
};

const semesters = ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6", "Sem 7", "Sem 8"];

const subjects: Subject[] = [
  { code: "M3", name: "Engineering Mathematics III", branch: "Common", accent: "violet", topics: 12, type: "Notes + PYQs" },
  { code: "DS", name: "Data Structures", branch: "Computer", accent: "blue", topics: 10, type: "Notes + Code" },
  { code: "OOP", name: "Object Oriented Programming", branch: "Computer", accent: "coral", topics: 8, type: "Notes + Practicals" },
  { code: "DBMS", name: "Database Management Systems", branch: "Computer", accent: "mint", topics: 9, type: "Notes + SQL" },
  { code: "COA", name: "Computer Organization", branch: "Computer", accent: "amber", topics: 7, type: "Notes + Diagrams" },
  { code: "DM", name: "Discrete Mathematics", branch: "Computer", accent: "pink", topics: 11, type: "Notes + PYQs" },
];

const resources = [
  { kind: "PDF", title: "Data Structures — Unit 3: Trees", meta: "Updated 2 days ago · 18 pages", accent: "blue", icon: "▤" },
  { kind: "PYQ", title: "DBMS End-Sem Question Bank", meta: "Summer 2022 — Winter 2025", accent: "amber", icon: "✦" },
  { kind: "CHEAT SHEET", title: "C++ STL Quick Reference", meta: "One-page revision sheet", accent: "mint", icon: "⌘" },
];

function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>;
}

function ArrowIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h13" /><path d="m13 6 6 6-6 6" /></svg>;
}

export function NotesHub() {
  const [semester, setSemester] = useState("Sem 3");
  const [query, setQuery] = useState("");
  const [branch, setBranch] = useState("All branches");
  const [activeNav, setActiveNav] = useState("Home");
  const [bookmarked, setBookmarked] = useState<string[]>([]);

  const filteredSubjects = useMemo(() => subjects.filter((subject) => {
    const text = `${subject.name} ${subject.code} ${subject.branch}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (branch === "All branches" || subject.branch === branch || subject.branch === "Common");
  }), [query, branch]);
  const filteredResources = useMemo(() => resources.filter((resource) => `${resource.title} ${resource.kind} ${resource.meta}`.toLowerCase().includes(query.toLowerCase())), [query]);

  return (
    <div className="notes-app">
      <aside className="notes-sidebar">
        <div className="notes-brand"><span className="notes-brand-mark">d</span><span>dbatu<span className="brand-dot">.</span>notes</span></div>
        <div className="sidebar-campus">RAJARAMBAPU INSTITUTE<br />OF TECHNOLOGY</div>
        <nav className="notes-nav" aria-label="Main navigation">
          {["Home", "Subjects", "Question Papers", "Practical Files"].map((item) => (
            <button key={item} className={`notes-nav-item ${activeNav === item ? "selected" : ""}`} onClick={() => setActiveNav(item)}>
              <span className="nav-icon">{item === "Home" ? "⌂" : item === "Subjects" ? "▦" : item === "Question Papers" ? "▤" : "⌁"}</span>{item}
              {item === "Question Papers" && <span className="nav-count">24</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-rule" />
        <div className="sidebar-heading">YOUR SPACE</div>
        <button className={`notes-nav-item ${activeNav === "Bookmarks" ? "selected" : ""}`} onClick={() => setActiveNav("Bookmarks")}><span className="nav-icon">♡</span>Bookmarks<span className="nav-count">{bookmarked.length}</span></button>
        <button className={`notes-nav-item ${activeNav === "Study plan" ? "selected" : ""}`} onClick={() => setActiveNav("Study plan")}><span className="nav-icon">◷</span>Study plan</button>
        <div className="sidebar-bottom">
          <div className="help-card"><span className="help-spark">✦</span><strong>Need a note?</strong><p>Tell us what’s missing and we’ll add it.</p><button>Suggest a resource <ArrowIcon /></button></div>
          <div className="sidebar-footer"><span className="status-dot" />Content is community maintained</div>
        </div>
      </aside>

      <main className="notes-main">
        <header className="notes-topbar">
          <div className="crumb"><span>DBATU</span><b>/</b><span className="crumb-current">Student Library</span></div>
          <div className="top-actions"><button className="icon-button" aria-label="Notifications">♢<span className="notification-dot" /></button><button className="avatar">AK</button></div>
        </header>

        <section className="notes-content">
          <div className="welcome-row"><div><div className="tiny-kicker">SATURDAY, 26 SEPTEMBER 2026</div><h1>Good morning, Akash<span className="sun-mark">✦</span></h1><p className="welcome-copy">Pick up where you left off, or explore your semester library.</p></div><div className="streak-card"><div className="streak-flame">♨</div><div><strong>4 day streak</strong><span>Keep showing up.</span></div><div className="streak-bars"><i /><i /><i /><i className="empty" /><i className="empty" /></div></div></div>

          <div className="semester-switcher"><div><span className="switch-label">CURRENT SEMESTER</span><span className="switch-value">B.Tech Computer Engineering</span></div><div className="semester-tabs">{semesters.map((item) => <button key={item} className={semester === item ? "active" : ""} onClick={() => setSemester(item)}>{item}</button>)}</div></div>

          <div className="search-row"><label className="library-search"><SearchIcon /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search subjects, topics, or resources..." /><kbd>⌘ K</kbd></label><select value={branch} onChange={(e) => setBranch(e.target.value)} aria-label="Filter branch"><option>All branches</option><option>Computer</option><option>Common</option></select><button className="filter-button">☷ <span>Filters</span></button></div>

          <section className="section-block"><div className="section-title-row"><div><div className="tiny-kicker">YOUR SEMESTER</div><h2>Subjects <span>{filteredSubjects.length}</span></h2></div><button className="text-link" onClick={() => { setQuery(""); setBranch("All branches"); }}>View all subjects <ArrowIcon /></button></div><div className="subject-grid">{filteredSubjects.map((subject) => <article key={subject.code} className={`subject-card ${subject.accent}`}><div className="subject-top"><span className="subject-code">{subject.code}</span><button className="bookmark-button" aria-label={`Bookmark ${subject.name}`} onClick={() => setBookmarked((current) => current.includes(subject.code) ? current.filter((id) => id !== subject.code) : [...current, subject.code])}>{bookmarked.includes(subject.code) ? "♥" : "♡"}</button></div><h3>{subject.name}</h3><p>{subject.branch} Engineering <span>·</span> {subject.topics} topics</p><div className="subject-bottom"><span>{subject.type}</span><button aria-label={`Open ${subject.name}`}><ArrowIcon /></button></div></article>)}</div>{filteredSubjects.length === 0 && <div className="empty-state">No subjects match “{query}”. Try a broader search.</div>}</section>

          <div className="lower-grid"><section className="section-block resource-section"><div className="section-title-row"><div><div className="tiny-kicker">FRESHLY ADDED</div><h2>Recent resources</h2></div><button className="text-link">See all <ArrowIcon /></button></div><div className="resource-list">{filteredResources.map((resource) => <article key={resource.title} className="resource-row"><div className={`resource-icon ${resource.accent}`}>{resource.icon}</div><div className="resource-info"><div className="resource-kind">{resource.kind}</div><h3>{resource.title}</h3><p>{resource.meta}</p></div><button className="resource-arrow" aria-label={`Open ${resource.title}`}><ArrowIcon /></button></article>)}{filteredResources.length === 0 && <div className="empty-state">No recent resources match “{query}”.</div>}</div></section><aside className="exam-card"><div className="exam-label"><span className="exam-icon">✎</span> EXAM DESK</div><h2>Finals are closer<br />than they feel.</h2><p>Plan your revision with the previous year papers and unit-wise checklists.</p><button className="exam-button">Open exam prep <ArrowIcon /></button><div className="exam-note"><span>●</span> 24 papers across 6 subjects</div></aside></div>
          <footer className="notes-footer"><span>Built for DBATU students, by DBATU students.</span><span>v1.0 · Made with care in Maharashtra</span></footer>
        </section>
      </main>
    </div>
  );
}
