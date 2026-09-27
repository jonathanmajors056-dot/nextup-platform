import type { Opportunity } from "./types";

const EARTH_RADIUS_KM = 6371;

export function distanceKm(from: { latitude: number; longitude: number }, to: { latitude: number; longitude: number }) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const dLat = toRadians(to.latitude - from.latitude);
  const dLng = toRadians(to.longitude - from.longitude);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function rankByLocation(items: Opportunity[], location: { latitude: number; longitude: number } | null, radiusKm = 250) {
  if (!location) return items;
  return items.map((item) => {
    if (item.format === "online" || item.latitude == null || item.longitude == null) return { ...item, distanceKm: null };
    return { ...item, distanceKm: Math.round(distanceKm(location, { latitude: item.latitude, longitude: item.longitude })) };
  }).filter((item) => item.format === "online" || item.distanceKm == null || item.distanceKm <= radiusKm)
    .sort((a, b) => {
      if (a.format === "online" && b.format !== "online") return 1;
      if (a.format !== "online" && b.format === "online") return -1;
      return (a.distanceKm ?? Number.MAX_SAFE_INTEGER) - (b.distanceKm ?? Number.MAX_SAFE_INTEGER);
    });
}

export function roundCoordinate(value: number) {
  return Math.round(value * 100) / 100;
}
