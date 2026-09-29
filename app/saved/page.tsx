import Link from "next/link";
import { Shell } from "@/components/Shell";
import { getCurrentUser } from "@/lib/auth/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { getApplicationStatus, listSavedOpportunities } from "@/lib/store";
import type { ApplicationStatus } from "@/lib/types";

const statusLabels: Record<ApplicationStatus, string> = {
  saved: "Saved",
  applying: "Applying",
  applied: "Applied",
  shortlisted: "Shortlisted",
  won: "Won",
  not_selected: "Not selected",
};

function dateLabel(value: string | null) {
  if (!value) return "No deadline";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export default async function SavedPage() {
  const user = await getCurrentUser();
  const userId = user?.id ?? (hasSupabaseConfig() ? null : "demo-student");
  const saved = await listSavedOpportunities(userId);
  const records = await Promise.all(saved.map(async (item) => ({ item, status: (await getApplicationStatus(userId, item.id)) ?? "saved" as ApplicationStatus })));
  const needsSignIn = hasSupabaseConfig() && !user;
  return <Shell><main className="main"><div className="eyebrow">Your application desk</div><h1 style={{ fontSize: "clamp(34px, 5vw, 52px)" }}>Keep your next moves visible.</h1><p className="hero-copy">A shortlist is only useful when it turns into action. Track what you’re applying to and what happens next.</p>{records.length ? <><div className="shortlist-summary"><div><span>Shortlisted</span><strong>{records.length}</strong></div><div><span>In progress</span><strong>{records.filter(({ status }) => ["applying", "applied", "shortlisted"].includes(status)).length}</strong></div><div><span>Won</span><strong>{records.filter(({ status }) => status === "won").length}</strong></div></div><div className="grid" style={{ marginTop: 24 }}>{records.map(({ item, status }) => <Link className="card op-card" href={`/opportunities/${item.id}`} key={item.id}><div className="card-top"><span className="pill">{item.category}</span><span className={`pill ${status === "won" ? "green" : status === "not_selected" ? "orange" : ""}`}>{statusLabels[status]}</span></div><h3>{item.title}</h3><p className="op-summary">{item.summary}</p><div className="meta"><div className="meta-row"><span>Next step</span><strong>{statusLabels[status]}</strong></div><div className="meta-row"><span>Deadline</span><strong>{dateLabel(item.registrationDeadline)}</strong></div></div></Link>)}</div></> : <><div className="card empty" style={{ marginTop: 24 }}>{needsSignIn ? "Sign in to keep a shortlist across devices." : "Save an opportunity and it will appear here."}</div><Link href={needsSignIn ? "/login?next=/saved" : "/"} className="button button-primary" style={{ marginTop: 16 }}>{needsSignIn ? "Sign in" : "Discover opportunities"}</Link></>}</main></Shell>;
}
