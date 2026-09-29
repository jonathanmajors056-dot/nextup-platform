export type ProductEvent =
  | "share_clicked"
  | "whatsapp_share_clicked"
  | "official_source_clicked"
  | "opportunity_viewed"
  | "save_clicked"
  | "progress_updated";

export function trackEvent(event: ProductEvent, opportunityId: string, metadata: { ref?: string | null; status?: string | null } = {}) {
  const ref = metadata.ref ?? new URLSearchParams(window.location.search).get("ref");
  const payload = JSON.stringify({
    event,
    opportunityId,
    path: window.location.pathname,
    ref,
    status: metadata.status ?? null,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      "/api/events",
      new Blob([payload], { type: "application/json" }),
    );
    return;
  }

  void fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  });
}
