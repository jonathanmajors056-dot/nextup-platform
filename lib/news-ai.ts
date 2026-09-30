import { newsCategories, type NewsCandidate } from "./news-types";

const schema = { type: "object", additionalProperties: false, properties: { summary: { type: "string" }, category: { type: "string", enum: [...newsCategories] }, tags: { type: "array", items: { type: "string" } }, topics: { type: "array", items: { type: "string" } }, entities: { type: "array", items: { type: "string" } }, geography: { type: "string", enum: ["India", "Global", "India + Global"] }, isBreaking: { type: "boolean" } }, required: ["summary", "category", "tags", "topics", "entities", "geography", "isBreaking"] };

export async function enrichNewsCandidate(candidate: NewsCandidate): Promise<NewsCandidate> {
  if (!process.env.OPENAI_API_KEY) return candidate;
  const response = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4o-mini", temperature: 0, response_format: { type: "json_schema", json_schema: { name: "news_enrichment", strict: true, schema } }, messages: [{ role: "system", content: "Enrich this technology news candidate using only facts present in the supplied text. Do not invent facts. Keep the summary concise and label uncertain content through the existing review status." }, { role: "user", content: JSON.stringify({ headline: candidate.headline, publisher: candidate.publisher, description: candidate.description, summary: candidate.summary, url: candidate.canonicalUrl }) }] }) });
  if (!response.ok) throw new Error(`News AI enrichment failed with ${response.status}`);
  const content = (await response.json()).choices?.[0]?.message?.content; if (!content) return candidate;
  const enriched = JSON.parse(content) as Partial<NewsCandidate>;
  return { ...candidate, ...enriched };
}
