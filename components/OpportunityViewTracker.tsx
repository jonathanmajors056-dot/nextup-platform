"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export function OpportunityViewTracker({ opportunityId }: { opportunityId: string }) {
  useEffect(() => {
    trackEvent("opportunity_viewed", opportunityId);
  }, [opportunityId]);

  return null;
}
