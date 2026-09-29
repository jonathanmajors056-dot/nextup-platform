"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      const supabase = getBrowserSupabase();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/` },
      });
      setMessage(error ? error.message : "Check your email for a secure sign-in link.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to start sign-in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="main" style={{ maxWidth: 560, margin: "0 auto" }}>
      <Link href="/" style={{ color: "var(--blue)", fontSize: 13, fontWeight: 800 }}>← Back to NextUp</Link>
      <section className="card form-card" style={{ marginTop: 24 }}>
        <div className="eyebrow">Your shortlist</div>
        <h1>Sign in to save opportunities.</h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>We will email you a one-time link. No password to remember.</p>
        {!hasSupabaseConfig() ? (
          <div className="notice">Authentication is not configured in this environment yet.</div>
        ) : (
          <form onSubmit={submit} className="form-grid">
            <div className="field-group full">
              <label htmlFor="email">Email address</label>
              <input className="field" id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
            </div>
            <div className="field-group full">
              <button className="button button-primary" disabled={busy}>{busy ? "Sending…" : "Email me a sign-in link"}</button>
            </div>
            {message && <p style={{ color: message.includes("secure") ? "var(--green)" : "var(--red)", margin: 0, fontSize: 13 }}>{message}</p>}
          </form>
        )}
      </section>
    </main>
  );
}
