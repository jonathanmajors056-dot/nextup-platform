import Link from "next/link";
import { Shell } from "@/components/Shell";
import { getOpportunity, listSaved } from "@/lib/store";
import { getViewerId } from "@/lib/identity";

export default async function SavedPage() {
  const ids = await listSaved(await getViewerId());
  const saved = (await Promise.all(ids.map((id) => getOpportunity(id)))).filter((item): item is NonNullable<typeof item> => Boolean(item));
  return <Shell><main className="main"><div className="eyebrow">Your shortlist</div><h1 style={{ fontSize: "clamp(34px, 5vw, 52px)" }}>Saved opportunities.</h1>{saved.length ? <div className="grid" style={{ marginTop: 24 }}>{saved.map((item) => <Link className="card op-card" href={`/opportunities/${item.id}`} key={item.id}><span className="pill">{item.category}</span><h3 style={{ marginTop: 18 }}>{item.title}</h3><p className="op-summary">{item.summary}</p></Link>)}</div> : <><div className="card empty" style={{ marginTop: 24 }}>Save an opportunity and it will appear here.</div><Link href="/" className="button button-primary" style={{ marginTop: 16 }}>Discover opportunities</Link></>}</main></Shell>;
}
