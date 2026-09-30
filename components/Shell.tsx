"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/", label: "Discover" },
  { href: "/newsportal", label: "NewsPortal" },
  { href: "/saved", label: "Saved" },
  { href: "/admin", label: "Admin" },
] as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link className="brand" href="/">
            <span className="brand-mark">N</span>
            <span>NextUp</span>
          </Link>
          <nav className="nav" aria-label="Primary navigation">
            <span className="topbar-status"><i /> Live pilot workspace</span>
            {navigation.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return <Link className={`nav-link${active ? " active" : ""}`} href={item.href} aria-current={active ? "page" : undefined} key={item.href}>{item.label}</Link>;
            })}
          </nav>
        </div>
      </header>
      {children}
      <div className="demo-badge">Pilot mode · demo data</div>
    </div>
  );
}
