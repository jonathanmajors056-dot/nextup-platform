import { z } from "zod";
import { getServerSupabase } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { enforceRateLimit } from "@/lib/rate-limit";
import { withRequestLogging } from "@/lib/logging";

const eventSchema = z.object({
  event: z.enum(["share_clicked", "whatsapp_share_clicked", "official_source_clicked", "opportunity_viewed", "save_clicked", "progress_updated"]),
  opportunityId: z.string().max(120).optional(),
  path: z.string().max(500).optional(),
  ref: z.string().max(50).nullable().optional(),
  status: z.string().max(30).nullable().optional(),
});

export async function POST(request: Request) {
  return withRequestLogging(request, "/api/events", async () => {
    try {
      const limited = await enforceRateLimit(request, { name: "event-write", limit: 120, window: "1m" });
      if (limited) return limited;
      const input = eventSchema.safeParse(await request.json());
      if (!input.success) return Response.json({ error: "Invalid event" }, { status: 400 });

      if (hasSupabaseConfig()) {
        const client = await getServerSupabase();
        const { error } = await client.from("product_events").insert({ event_name: input.data.event, opportunity_id: input.data.opportunityId ?? null, metadata: { path: input.data.path ?? null, ref: input.data.ref ?? null, status: input.data.status ?? null } });
        if (error) console.error(JSON.stringify({ level: "error", event: "product_event.write_failed", error: error.message }));
      } else if (process.env.NODE_ENV !== "production") {
        console.info(JSON.stringify({ level: "info", event: "product_event.received", name: input.data.event }));
      }
      return Response.json({ ok: true });
    } catch {
      return Response.json({ error: "Invalid event payload" }, { status: 400 });
    }
  });
}
