import { NextUpAIPortal } from "@/components/NextUpAIPortal";
import { getAIStatus } from "@/lib/ai-client";
import { Shell } from "@/components/Shell";

export const metadata = {
  title: "NextUp AI — resilient opportunity intelligence",
  description: "Turn noisy student opportunity messages into structured, review-ready drafts with NextUp AI.",
};

export default function NextUpAIPage() {
  return <Shell><NextUpAIPortal initialStatus={getAIStatus()} /></Shell>;
}
