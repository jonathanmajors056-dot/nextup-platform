"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthForm({ enabled }: { enabled: boolean }) {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const client = createSupabaseBrowserClient();
    if (!client) return;
    void client.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const client = createSupabaseBrowserClient();
    if (!client) return setMessage("Authentication is not configured on this deployment yet.");
    setBusy(true); setMessage("");
    const result = mode === "sign-in" ? await client.auth.signInWithPassword({ email, password }) : await client.auth.signUp({ email, password });
    setBusy(false);
    if (result.error) return setMessage(result.error.message);
    if (mode === "sign-up" && !result.data.session) return setMessage("Account created. Check your email to confirm access, then sign in.");
    window.location.assign("/");
  }

  async function signOut() {
    const client = createSupabaseBrowserClient();
    if (client) await client.auth.signOut();
    setSignedIn(false); setMessage("You are signed out. Your anonymous pilot workspace remains available.");
  }

  if (!enabled) return <div className="auth-disabled"><strong>Account sign-in is not enabled yet.</strong><p>The platform still works in pilot mode with a browser-scoped workspace. Add the Supabase anon key to enable durable student accounts.</p><Link className="button button-secondary" href="/">Continue to Discover</Link></div>;
  if (signedIn) return <div className="auth-disabled"><strong>Your NextUp account is active.</strong><p>Your saved opportunities now follow your account instead of this browser.</p><div className="button-row"><Link className="button button-primary" href="/saved">Open saved opportunities</Link><button className="button button-secondary" type="button" onClick={signOut}>Sign out</button></div></div>;

  return <form className="auth-form" onSubmit={submit}>
    <div className="field-group"><label htmlFor="auth-email">Email</label><input className="field" id="auth-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></div>
    <div className="field-group"><label htmlFor="auth-password">Password</label><input className="field" id="auth-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "sign-in" ? "current-password" : "new-password"} minLength={6} required /></div>
    <button className="button button-primary" disabled={busy}>{busy ? "Working…" : mode === "sign-in" ? "Sign in" : "Create account"}</button>
    {message && <p className="action-error" role="status">{message}</p>}
    <button className="auth-switch" type="button" onClick={() => { setMode(mode === "sign-in" ? "sign-up" : "sign-in"); setMessage(""); }}>{mode === "sign-in" ? "Need an account? Create one" : "Already have an account? Sign in"}</button>
  </form>;
}
