import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OpportunityViewTracker } from "@/components/OpportunityViewTracker";
import { OfficialSourceLink } from "@/components/OfficialSourceLink";
import { ProgressButton } from "@/components/ProgressButton";
import { SaveButton } from "@/components/SaveButton";
import { ShareButton } from "@/components/ShareButton";
import { Shell } from "@/components/Shell";
import { getApplicationStatus, getOpportunity } from "@/lib/store";
import { getCurrentUser } from "@/lib/auth/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

function dateLabel(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(value))
    : "Not listed";
}

async function loadOpportunity(params: Promise<{ id: string }>) {
  const { id } = await params;
  const item = await getOpportunity(id);
  if (!item || item.status !== "published") notFound();
  return item;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const item = await loadOpportunity(params);
  return {
    title: `${item.title} · NextUp`,
    description: item.summary,
    openGraph: {
      title: `${item.title} · NextUp`,
      description: item.summary,
      type: "article",
    },
  };
}

export default async function OpportunityPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const item = await loadOpportunity(params);
  const sharedFromFriend = (await searchParams).ref === "share";
  const user = await getCurrentUser();
  const progress = await getApplicationStatus(user?.id ?? (hasSupabaseConfig() ? null : "demo-student"), item.id);

  return (
    <Shell>
      <OpportunityViewTracker opportunityId={item.id} />
      <main className="main">
        <Link href="/" style={{ color: "var(--blue)", fontSize: 13, fontWeight: 800 }}>
          ← Back to opportunities
        </Link>
        <div className="detail-layout" style={{ marginTop: 20 }}>
          <article className="card detail-main">
            <div className="card-top">
              <span className="pill">{item.category}</span>
              <span className="verified">
                ✓ {item.verificationStatus === "officially_verified" ? "Officially verified" : "Community reviewed"}
              </span>
            </div>
            <h1>{item.title}</h1>
            <p className="detail-summary">{item.summary}</p>
            <div className="detail-section">
              <h2>About this opportunity</h2>
              <p>{item.description}</p>
            </div>
            <div className="detail-section">
              <h2>Who it is for</h2>
              <p>{item.eligibility || "Eligibility details are being confirmed by the organizer."}</p>
            </div>
            <div className="detail-section">
              <h2>Skills and tags</h2>
              <div className="tags">
                {[...item.skills, ...item.tags].map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </article>
          <aside className="card detail-side">
            <div className="fact-list">
              <div className="fact"><span className="fact-icon" /><div><span>Registration deadline</span><strong>{dateLabel(item.registrationDeadline)}</strong></div></div>
              <div className="fact"><span className="fact-icon" /><div><span>Format</span><strong>{item.format} · {item.location}</strong></div></div>
              <div className="fact"><span className="fact-icon" /><div><span>Organizer</span><strong>{item.organizer}</strong></div></div>
              <div className="fact"><span className="fact-icon" /><div><span>Fees</span><strong>{item.fees || "Check official source"}</strong></div></div>
              <div className="fact"><span className="fact-icon" /><div><span>Benefit</span><strong>{item.benefit || "See official source"}</strong></div></div>
            </div>
            <div className="button-row" style={{ marginTop: 24 }}>
              <OfficialSourceLink opportunityId={item.id} href={item.officialUrl} />
              <SaveButton opportunityId={item.id} />
            </div>
            <ProgressButton opportunityId={item.id} initialStatus={progress} />
            {sharedFromFriend && <p className="share-context">A friend thought this was worth your week. Save it before the deadline disappears in chat.</p>}
            <div className="share-prompt">
              <strong>Know someone who should see this?</strong>
              <span>Send the opportunity with its deadline and source attached.</span>
              <ShareButton opportunityId={item.id} title={item.title} summary={item.summary} deadline={dateLabel(item.registrationDeadline)} officialUrl={item.officialUrl} />
            </div>
            <p style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.5, margin: "18px 0 0" }}>
              Source: {item.sourceUrl || item.officialUrl}
            </p>
          </aside>
        </div>
      </main>
    </Shell>
  );
}
