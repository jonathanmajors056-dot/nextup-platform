"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="state-page"><div className="state-icon">!</div><p className="eyebrow">Signal interrupted</p><h1>We couldn’t load this view.</h1><p className="state-copy">Your saved data is safe. Try the request again, or return to the opportunity desk.</p><div className="button-row"><button className="button button-primary" onClick={() => reset()}>Try again</button><a className="button button-secondary" href="/">Back to NextUp</a></div></main>;
}
