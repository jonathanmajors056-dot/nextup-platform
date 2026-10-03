import { attachViewerCookie, viewerIdFromRequest } from "@/lib/identity";
import { getLocationPreference, saveLocationPreference } from "@/lib/store";
import { roundCoordinate } from "@/lib/geo";
import { geocodePlace } from "@/lib/geocoding";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/rate-limit";

const preferenceSchema = z.object({
  label: z.string().trim().min(1).max(120),
  city: z.string().trim().max(80).default(""),
  region: z.string().trim().max(80).default(""),
  country: z.string().trim().max(80).default("India"),
  latitude: z.number().min(-90).max(90).nullable().default(null),
  longitude: z.number().min(-180).max(180).nullable().default(null),
  precision: z.enum(["city", "country", "approximate"]).default("city"),
  consentedToGeolocation: z.boolean().default(false),
  radiusKm: z.number().int().min(5).max(500).default(250),
});

export async function GET(request: Request) {
  const viewerId = viewerIdFromRequest(request);
  const response = Response.json({ preference: await getLocationPreference(viewerId) });
  return attachViewerCookie(response, viewerId, request);
}

export async function PUT(request: Request) {
  const limited = await enforceRateLimit(request, "locations"); if (limited) return limited;
  try {
    const viewerId = viewerIdFromRequest(request);
    const parsed = preferenceSchema.parse(await request.json());
    let latitude = parsed.latitude == null ? null : roundCoordinate(parsed.latitude);
    let longitude = parsed.longitude == null ? null : roundCoordinate(parsed.longitude);
    let precision = parsed.precision;
    if (latitude == null && longitude == null && !parsed.consentedToGeolocation) {
      const geocoded = await geocodePlace(parsed.label, parsed.country).catch(() => null);
      if (geocoded) { latitude = geocoded.latitude; longitude = geocoded.longitude; precision = "city"; }
    }
    const preference = await saveLocationPreference({
      userId: viewerId,
      ...parsed,
      latitude, longitude, precision,
    });
    return attachViewerCookie(Response.json({ preference }), viewerId, request);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Invalid location preference" }, { status: 400 });
  }
}
