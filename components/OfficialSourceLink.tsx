"use client";

import { trackEvent } from "@/lib/analytics";

export function OfficialSourceLink({ opportunityId, href }: { opportunityId: string; href: string }) {
  return <a className="button button-primary" href={href} target="_blank" rel="noreferrer" onClick={() => trackEvent("official_source_clicked", opportunityId)}>Open official source ↗</a>;
}
