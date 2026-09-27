import { z } from "zod";

const querySchema = z.object({
  center: z.string().regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/),
  zoom: z.coerce.number().int().min(1).max(18).default(5),
  markers: z.string().max(1600).optional(),
});

export async function GET(request: Request) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return Response.json({ error: "Google Maps is not configured. The local map fallback is active." }, { status: 503 });
  try {
    const values = querySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const params = new URLSearchParams({ center: values.center, zoom: String(values.zoom), size: "900x420", scale: "2", maptype: "roadmap", key });
    if (values.markers) params.set("markers", values.markers);
    const upstream = await fetch(`https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`, { next: { revalidate: 300 } });
    if (!upstream.ok) return Response.json({ error: "Google Maps could not render this map." }, { status: 502 });
    return new Response(await upstream.arrayBuffer(), { headers: { "Content-Type": upstream.headers.get("content-type") || "image/png", "Cache-Control": "public, max-age=300" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Invalid map request" }, { status: 400 });
  }
}
