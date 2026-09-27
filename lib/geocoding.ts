import { roundCoordinate } from "./geo";

export async function geocodePlace(label: string, country = "India") {
  const key = process.env.GOOGLE_GEOCODING_API_KEY;
  if (!key || !label.trim()) return null;
  const params = new URLSearchParams({ address: `${label}, ${country}`, key });
  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`, { signal: AbortSignal.timeout(8000), next: { revalidate: 86400 } });
  if (!response.ok) throw new Error(`Geocoding returned HTTP ${response.status}.`);
  const payload = await response.json() as { status?: string; results?: Array<{ geometry?: { location?: { lat?: number; lng?: number } } }> };
  const location = payload.results?.[0]?.geometry?.location;
  if (payload.status !== "OK" || location?.lat == null || location.lng == null) return null;
  return { latitude: roundCoordinate(location.lat), longitude: roundCoordinate(location.lng) };
}
