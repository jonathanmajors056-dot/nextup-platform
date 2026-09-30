import { Shell } from "@/components/Shell";
import { AdminConsole } from "@/components/AdminConsole";
import { listReview } from "@/lib/store";
import { listProviders } from "@/lib/providers";
import { NewsAdminPanel } from "@/components/NewsAdminPanel";
import { listNewsProviders, listNewsReview } from "@/lib/news";
import { getLaunchReadiness } from "@/lib/launch-readiness";
import { LaunchReadiness } from "@/components/LaunchReadiness";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [review, newsReview] = await Promise.all([listReview(), listNewsReview()]);
  return <Shell><main className="main"><div className="admin-header"><div><div className="eyebrow">Operations</div><h1 style={{ fontSize: "clamp(34px, 5vw, 52px)", marginBottom: 12 }}>Review the signal.</h1><p>Turn scattered opportunity messages into clean, trusted listings. Nothing reaches students until an admin approves it.</p></div></div><LaunchReadiness readiness={getLaunchReadiness()} /><AdminConsole initialReview={review} initialProviders={listProviders()} /><NewsAdminPanel initialProviders={listNewsProviders()} initialReview={newsReview} /></main></Shell>;
}
