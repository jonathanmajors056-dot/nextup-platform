import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export async function Shell({ children }: { children: React.ReactNode }) {
  const authEnabled = hasSupabaseConfig();
  const user = authEnabled ? await getCurrentUser() : null;

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
            <Link className="nav-link" href="/saved">Saved</Link>
            <Link className="nav-link" href="/admin">Admin</Link>
            {authEnabled && !user && <Link className="nav-link" href="/login">Sign in</Link>}
          </nav>
        </div>
      </header>
      {children}
      <div className="demo-badge">Pilot mode · source-checked seed</div>
    </div>
  );
}
