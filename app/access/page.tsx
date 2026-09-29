"use client";

import { FormEvent, useState } from "react";

export default function AccessPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const response = await fetch("/api/access", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code }) });
    if (!response.ok) {
      setError("That access code is not valid. Please try again.");
      setBusy(false);
      return;
    }
    window.location.assign("/");
  }

  return <main className="access-page"><div className="access-glow access-glow-one" /><div className="access-glow access-glow-two" /><section className="access-card"><div className="access-logo"><span>✓</span> Measure<span>Sure</span></div><div className="access-icon">⌁</div><p className="access-kicker">PRIVATE VERIFICATION PORTAL</p><h1>Welcome back.</h1><p className="access-copy">This workspace is private. Enter your access code to view the instrument verification dashboard.</p><form onSubmit={submit}><label htmlFor="access-code">Access code</label><input id="access-code" type="password" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Enter your private code" autoComplete="current-password" autoFocus required /><button type="submit" disabled={busy}>{busy ? "Checking access…" : "Enter private workspace →"}</button>{error && <p className="access-error" role="alert">{error}</p>}</form><div className="access-foot"><span>SIH26036</span><span>Protected workspace</span></div></section></main>;
}
