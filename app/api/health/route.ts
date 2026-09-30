import { getLaunchReadiness } from "@/lib/launch-readiness";

export const dynamic = "force-dynamic";

export async function GET() {
  const readiness = getLaunchReadiness();
  return Response.json({
    service: "nextup",
    status: readiness.pilotReady ? "ready" : "pilot-setup-required",
    ...readiness,
  }, { status: 200, headers: { "Cache-Control": "no-store" } });
}
