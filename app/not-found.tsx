import Link from "next/link";

export default function NotFound() {
  return (
    <main className="main" style={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
      <section className="card" style={{ maxWidth: 560, textAlign: "center" }}>
        <div className="eyebrow">404</div>
        <h1>That opportunity moved on.</h1>
        <p className="muted-copy">The page may have expired or the link may be incomplete.</p>
        <Link className="button button-primary" href="/">Return to NextUp</Link>
      </section>
    </main>
  );
}
