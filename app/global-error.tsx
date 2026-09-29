"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(JSON.stringify({ level: "error", event: "ui.global_error", message: error.message, digest: error.digest }));
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, fontFamily: "system-ui, sans-serif" }}>
          <section style={{ maxWidth: 560, textAlign: "center" }}>
            <p style={{ opacity: 0.7 }}>NextUp</p>
            <h1>We hit an unexpected error.</h1>
            <p style={{ opacity: 0.7 }}>Please try again. If this continues, check the deployment logs.</p>
            <button type="button" onClick={() => reset()}>Reload NextUp</button>
          </section>
        </main>
      </body>
    </html>
  );
}
