import type { IngestionCandidate } from "./types";

function text(value: string | undefined) {
  return (value ?? "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
}

function tags(block: string, name: string) {
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return text(match?.[1]);
}

function atomLink(block: string) {
  return block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i)?.[1] ?? tags(block, "link");
}

export function parseRssFeed(xml: string, providerId: string): IngestionCandidate[] {
  const blocks = Array.from(xml.matchAll(/<(?:item|entry)\b[\s\S]*?<\/(?:item|entry)>/gi), (match) => match[0]);
  return blocks.map((block) => {
    const title = tags(block, "title");
    const officialUrl = atomLink(block) || tags(block, "guid");
    const description = tags(block, "description") || tags(block, "summary") || tags(block, "content");
    const date = tags(block, "pubDate") || tags(block, "published") || tags(block, "updated");
    return { providerId, externalId: tags(block, "guid") || officialUrl, title, description, summary: description.slice(0, 220), organizer: "Source organizer", officialUrl, sourceUrl: officialUrl, format: "online", location: "Online", eventStartDate: date ? new Date(date).toISOString() : null, rawSource: block, tags: ["rss"] } satisfies IngestionCandidate;
  }).filter((candidate) => candidate.title.length >= 3 && Boolean(candidate.officialUrl));
}
