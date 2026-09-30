import { listNewsProviders } from "@/lib/news";
export async function GET() { return Response.json({ providers: listNewsProviders(), checkedAt: new Date().toISOString() }); }
