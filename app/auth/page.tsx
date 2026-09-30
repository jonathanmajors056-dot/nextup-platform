import { Shell } from "@/components/Shell";
import { AuthForm } from "@/components/AuthForm";

export const dynamic = "force-dynamic";

export default function AuthPage() {
  return <Shell><main className="main auth-main"><section className="auth-card card"><div className="eyebrow">Your NextUp workspace</div><h1>Keep your signal with you.</h1><p className="auth-intro">Sign in to keep saved opportunities across devices. Your account never changes the review rules: every listing still keeps its source and approval state.</p><AuthForm enabled={Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)} /></section></main></Shell>;
}
