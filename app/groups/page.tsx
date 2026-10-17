import { Shell } from "@/components/Shell";
import { communityGroups, nextUpWhatsAppLink } from "@/lib/community";

export default function GroupsPage() {
  return (
    <Shell>
      <main className="main groups-page">
        <header className="groups-hero">
          <p className="eyebrow">Community groups</p>
          <h1>Find your people on NextUp.</h1>
          <p>Community and event groups carried over from the local NextUp source. Public organiser pages remain the source of truth; message NextUp when you need help finding the right room.</p>
        </header>
        <div className="groups-grid">
          {communityGroups.map((group) => (
            <article className="group-card" key={group.id}>
              <div className="group-card-top"><span className="group-mark">✦</span><span className="group-location">{group.location}</span></div>
              <h2>{group.name}</h2>
              <p className="group-focus">{group.focus}</p>
              <p>{group.description}</p>
              <div className="group-actions">
                {group.sourceUrl ? <a className="button button-primary" href={group.sourceUrl} target="_blank" rel="noreferrer">Open public page ↗</a> : <span className="button button-secondary">Public page pending</span>}
                <a className="button button-secondary" href={nextUpWhatsAppLink(`Hi NextUp, please help me find the ${group.name} community group.`)} target="_blank" rel="noreferrer">Ask on WhatsApp</a>
              </div>
            </article>
          ))}
        </div>
      </main>
    </Shell>
  );
}
