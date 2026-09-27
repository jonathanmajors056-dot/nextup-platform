import Link from "next/link";
import type { LocationPreference, Opportunity } from "@/lib/types";

function position(item: Opportunity, items: Opportunity[]) {
  const points = items.filter((value) => value.latitude != null && value.longitude != null);
  const minLat = Math.min(...points.map((value) => value.latitude as number));
  const maxLat = Math.max(...points.map((value) => value.latitude as number));
  const minLng = Math.min(...points.map((value) => value.longitude as number));
  const maxLng = Math.max(...points.map((value) => value.longitude as number));
  return { left: `${12 + (((item.longitude as number) - minLng) / Math.max(0.01, maxLng - minLng)) * 76}%`, top: `${75 - (((item.latitude as number) - minLat) / Math.max(0.01, maxLat - minLat)) * 55}%` };
}

export function OpportunityMap({ opportunities, locationPreference, mapsEnabled }: { opportunities: Opportunity[]; locationPreference: LocationPreference | null; mapsEnabled: boolean }) {
  const physical = opportunities.filter((item) => item.format !== "online" && item.latitude != null && item.longitude != null);
  const center = locationPreference?.latitude != null && locationPreference.longitude != null ? `${locationPreference.latitude},${locationPreference.longitude}` : physical[0] ? `${physical[0].latitude},${physical[0].longitude}` : null;
  const markers = physical.map((item) => `color:0x2563eb|${item.latitude},${item.longitude}`).join("|");
  const staticMap = center ? `/api/maps/static?center=${encodeURIComponent(center)}&zoom=5&markers=${encodeURIComponent(markers)}` : "";
  return <section className="map-portal" aria-label="Nearby opportunity map"><div className="section-heading"><div><span className="eyebrow">Opportunity map</span><h2>Events around your signal</h2><p>{locationPreference ? `Physical events near ${locationPreference.label}; online events remain global.` : "Choose a city to rank nearby physical events."}</p></div>{center && <a className="text-link" href={`https://www.google.com/maps/search/?api=1&query=${center}`} target="_blank" rel="noreferrer">Open in Google Maps ↗</a>}</div>{physical.length ? <div className="map-stage" role="img" aria-label={`${physical.length} mapped opportunity${physical.length === 1 ? "" : "ies"}`}>{mapsEnabled && <img className="map-image" src={staticMap} alt="Google Maps preview of nearby opportunities" />}{physical.map((item) => <Link key={item.id} href={`/opportunities/${item.id}`} className="map-pin" style={position(item, physical)} aria-label={`${item.title}, ${item.location}`}><span>{item.category.slice(0, 1)}</span><strong>{item.title}</strong></Link>)}<div className="map-legend"><span /><span>{mapsEnabled ? "Google Maps preview" : "Approximate opportunity map"}</span></div></div> : <div className="map-empty"><strong>Your map will light up as sources add coordinates.</strong><span>Online opportunities stay available without location.</span></div>}{center && <p className="privacy-note">Map preview uses approximate opportunity coordinates. Google Maps rendering is optional and remains disabled until a server-side key is configured.</p>}</section>;
}
