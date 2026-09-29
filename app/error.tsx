"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(JSON.stringify({ level: "error", event: "ui.route_error", message: error.message, digest: error.digest }));
  }, [error]);

  return (
    <main className="main" style={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
      <section className="card" style={{ maxWidth: 560, textAlign: "center" }}>
        <div className="eyebrow">Something went wrong</div>
        <h1>NextUp needs a quick reset.</h1>
        <p className="muted-copy">The error was recorded. Try the page again, or return to the opportunity desk.</p>
        <div className="quick-actions" style={{ justifyContent: "center" }}>
          <button className="button button-primary" type="button" onClick={() => reset()}>Try again</button>
          <Link className="button button-light" href="/">Go home</Link>
        </div>
      </section>
    </main>
  );
}
