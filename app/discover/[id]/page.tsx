import Link from "next/link";
import { notFound } from "next/navigation";
import { getOpportunity, opportunities } from "@/data/opportunities";

export function generateStaticParams() {
  return opportunities.map(({ id }) => ({ id }));
}

export default async function OpportunityDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opportunity = getOpportunity(id);
  if (!opportunity) notFound();
  return <main className="page platform-shell"><Link className="button ghost" href="/discover">← Back to Discover</Link><section className="section detail-layout"><div><div className="eyebrow">{opportunity.category} / {opportunity.format}</div><h1>{opportunity.title}</h1><p className="detail-copy">{opportunity.description}</p><div className="meta"><span className="chip green">{opportunity.verified ? "✓ verified source" : "source review pending"}</span><span className="chip amber">{opportunity.deadlineLabel}</span><span className="chip">{opportunity.location}</span></div><div className="hero-actions"><a className="button" href={opportunity.sourceUrl} target="_blank" rel="noreferrer">Open official source ↗</a><Link className="button ghost" href="/saved">View shortlist</Link></div></div><aside className="panel panel-pad"><div className="eyebrow">Signal brief</div><dl className="detail-facts"><div><dt>Organizer</dt><dd>{opportunity.organization}</dd></div><div><dt>Eligibility</dt><dd>{opportunity.eligibility}</dd></div><div><dt>Format</dt><dd>{opportunity.format}</dd></div><div><dt>Tags</dt><dd>{opportunity.tags.join(" · ")}</dd></div></dl></aside></section></main>;
}
