import { Shell } from "@/components/Shell";
import { AdminConsole } from "@/components/AdminConsole";
import { listReview } from "@/lib/store";
import { listProviders } from "@/lib/providers";

export default async function AdminPage() {
  const review = await listReview();
  return <Shell><main className="main"><div className="admin-header"><div><div className="eyebrow">Operations</div><h1 style={{ fontSize: "clamp(34px, 5vw, 52px)", marginBottom: 12 }}>Review the signal.</h1><p>Turn scattered opportunity messages into clean, trusted listings. Nothing reaches students until an admin approves it.</p></div></div><AdminConsole initialReview={review} initialProviders={listProviders()} /></main></Shell>;
}
