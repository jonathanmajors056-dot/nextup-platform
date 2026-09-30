import Link from "next/link";

export default function NotFound() {
  return <main className="state-page"><div className="state-icon">?</div><p className="eyebrow">Nothing here yet</p><h1>This opportunity moved on.</h1><p className="state-copy">It may have expired, been archived, or the link may be incomplete.</p><Link className="button button-primary" href="/">Discover live opportunities</Link></main>;
}
