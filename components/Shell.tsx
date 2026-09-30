import Link from "next/link";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link className="brand" href="/">
            <span className="brand-mark">N</span>
            <span>NextUp</span>
          </Link>
          <nav className="nav" aria-label="Primary navigation">
            <span className="topbar-status"><i /> Pilot workspace</span>
            <Link className="nav-link active" href="/">Discover</Link>
            <Link className="nav-link" href="/newsportal">NewsPortal</Link>
            <Link className="nav-link" href="/saved">Saved</Link>
            <Link className="nav-link" href="/admin">Admin</Link>
          </nav>
        </div>
      </header>
      {children}
      <div className="demo-badge">Pilot mode · demo data</div>
    </div>
  );
}
