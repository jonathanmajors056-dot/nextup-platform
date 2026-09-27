import { listPublished } from "@/lib/store";
import { rankByLocation } from "@/lib/geo";

function numberParam(value: string | null) {
  const parsed = value == null ? NaN : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latitude = numberParam(searchParams.get("lat"));
  const longitude = numberParam(searchParams.get("lng"));
  const radiusKm = Math.min(500, Math.max(1, numberParam(searchParams.get("radiusKm")) ?? 250));
  const data = rankByLocation(await listPublished({ q: searchParams.get("q") ?? undefined, category: searchParams.get("category") ?? undefined, format: searchParams.get("format") ?? undefined }), latitude != null && longitude != null ? { latitude, longitude } : null, radiusKm);
  return Response.json({ data });
}
