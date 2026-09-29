"use client";

import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";

export function ShareButton({ opportunityId, title, summary, deadline, officialUrl }: { opportunityId: string; title: string; summary: string; deadline: string; officialUrl: string }) {
  const [label, setLabel] = useState("Send to a friend");
  const [busy, setBusy] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setShareUrl(`${window.location.origin}/opportunities/${opportunityId}?ref=share`);
  }, [opportunityId]);

  const message = `This looks like you: ${title}. ${summary} Deadline: ${deadline}. Official source: ${officialUrl} Found it on NextUp: ${shareUrl}`;
  const whatsappUrl = shareUrl ? `https://wa.me/?text=${encodeURIComponent(message)}` : "#";

  async function share() {
    setBusy(true);
    trackEvent("share_clicked", opportunityId);
    try {
      if (navigator.share) {
        await navigator.share({ title, text: message, url: shareUrl });
        setLabel("Shared ✓");
      } else if (navigator.clipboard && shareUrl) {
        await navigator.clipboard.writeText(message);
        setLabel("Message copied ✓");
      } else {
        setLabel("Use WhatsApp below");
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setLabel("Share again");
    } finally {
      setBusy(false);
    }
  }

  return <div className="share-actions"><button className="button button-primary" type="button" onClick={share} disabled={!shareUrl || busy}>{!shareUrl || busy ? "Preparing…" : label}</button>{shareUrl ? <a className="button button-secondary" href={whatsappUrl} target="_blank" rel="noreferrer" onClick={() => trackEvent("whatsapp_share_clicked", opportunityId)}>WhatsApp ↗</a> : <span className="button button-secondary share-placeholder" aria-hidden="true">Preparing…</span>}</div>;
}
