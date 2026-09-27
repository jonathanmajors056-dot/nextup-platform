"use client";

import { useState } from "react";
import type { LocationPreference } from "@/lib/types";

export function LocationPreferences({ initial }: { initial: LocationPreference | null }) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [message, setMessage] = useState(initial ? `Showing nearby events for ${initial.label}.` : "Choose a city to personalize nearby events.");
  const [busy, setBusy] = useState(false);

  async function save(value: { label: string; latitude: number | null; longitude: number | null; precision: LocationPreference["precision"]; consentedToGeolocation: boolean }) {
    setBusy(true);
    const response = await fetch("/api/location/preferences", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...value, city: value.label, country: "India" }) });
    const data = await response.json().catch(() => ({}));
    setBusy(false);
    setMessage(response.ok ? `Showing nearby events for ${data.preference.label}.` : (data.error || "Could not save location."));
  }

  function useDeviceLocation() {
    if (!navigator.geolocation) { setMessage("Location is unavailable in this browser."); return; }
    setMessage("Waiting for your permission…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => save({ label: "Near you", latitude: coords.latitude, longitude: coords.longitude, precision: "approximate", consentedToGeolocation: true }),
      () => setMessage("Location permission was not granted. You can still choose a city."),
      { enableHighAccuracy: false, maximumAge: 300000, timeout: 8000 },
    );
  }

  return <section className="location-card" aria-label="Location preferences"><div><span className="eyebrow">Personalize the signal</span><h2>Find opportunities near you.</h2><p>{message} Online events remain visible worldwide.</p></div><div className="location-actions"><input className="field" aria-label="City or region" value={label} onChange={(event) => setLabel(event.target.value)} placeholder="City or region, e.g. Bengaluru" /><button className="button button-primary" disabled={busy || !label.trim()} onClick={() => save({ label: label.trim(), latitude: null, longitude: null, precision: "city", consentedToGeolocation: false })}>{busy ? "Saving…" : "Save city"}</button><button className="button button-secondary" disabled={busy} onClick={useDeviceLocation}>Use my approximate location</button></div><small className="privacy-note">Your precise location is never stored by default. Device location is optional and rounded before storage.</small></section>;
}
