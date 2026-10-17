type ProviderName = "groq" | "gemini" | "openrouter" | "huggingface" | "openai";

type ProviderConfig = {
  name: ProviderName;
  model: string;
  key: string;
};

type ProviderRuntime = {
  failures: number;
  unavailableUntil: number;
  lastError?: string;
  lastSuccessAt?: string;
};

const providerRuntime = new Map<ProviderName, ProviderRuntime>();
const cooldownBaseMs = 15_000;
const cooldownMaxMs = 120_000;

function present(value: string | undefined) {
  return Boolean(value?.trim());
}

function configuredProviders(): ProviderConfig[] {
  const providers: ProviderConfig[] = [];
  if (present(process.env.GROQ_API_KEY)) providers.push({ name: "groq", key: process.env.GROQ_API_KEY!, model: process.env.GROQ_MODEL || "openai/gpt-oss-20b" });
  if (present(process.env.GEMINI_API_KEY)) providers.push({ name: "gemini", key: process.env.GEMINI_API_KEY!, model: process.env.GEMINI_MODEL || "gemini-2.5-flash" });
  if (present(process.env.OPENROUTER_API_KEY)) providers.push({ name: "openrouter", key: process.env.OPENROUTER_API_KEY!, model: process.env.OPENROUTER_MODEL || "openrouter/free" });
  if (present(process.env.HF_TOKEN)) providers.push({ name: "huggingface", key: process.env.HF_TOKEN!, model: process.env.HF_MODEL || "deepseek-ai/DeepSeek-V3-0324" });
  if (present(process.env.OPENAI_API_KEY)) providers.push({ name: "openai", key: process.env.OPENAI_API_KEY!, model: process.env.OPENAI_MODEL || "gpt-4o-mini" });
  return providers;
}

export function hasAIProvider() {
  return configuredProviders().length > 0;
}

export function configuredAIProviders() {
  return configuredProviders().map((provider) => provider.name);
}

function runtimeFor(name: ProviderName) {
  const existing = providerRuntime.get(name);
  if (existing) return existing;
  const created: ProviderRuntime = { failures: 0, unavailableUntil: 0 };
  providerRuntime.set(name, created);
  return created;
}

export function getAIStatus() {
  const now = Date.now();
  const providers = configuredProviders().map(({ name, model }) => {
    const runtime = runtimeFor(name);
    return {
      name,
      model,
      state: (runtime.unavailableUntil > now ? "cooldown" : "ready") as "cooldown" | "ready",
      failures: runtime.failures,
      lastError: runtime.lastError,
      lastSuccessAt: runtime.lastSuccessAt,
      retryAt: runtime.unavailableUntil > now ? new Date(runtime.unavailableUntil).toISOString() : null,
    };
  });
  return {
    portal: "NextUp AI",
    configuredCount: providers.length,
    fallbackReady: providers.length > 0,
    order: providers.map((provider) => provider.name),
    providers,
  };
}

async function readJson(response: Response) {
  const text = await response.text();
  if (!response.ok) throw new Error(`provider returned ${response.status}`);
  try {
    return JSON.parse(text) as Record<string, any>;
  } catch {
    throw new Error("provider returned invalid JSON");
  }
}

async function callOpenAICompatible(provider: ProviderConfig, system: string, user: string) {
  const endpoint = provider.name === "groq" ? "https://api.groq.com/openai/v1/chat/completions" : provider.name === "openrouter" ? "https://openrouter.ai/api/v1/chat/completions" : provider.name === "huggingface" ? "https://router.huggingface.co/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
  const json = await readJson(await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${provider.key}` },
    body: JSON.stringify({
      model: provider.model,
      temperature: 0,
      response_format: provider.name === "openai" || provider.name === "groq" || provider.name === "openrouter" ? { type: "json_object" } : undefined,
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
    }),
    signal: AbortSignal.timeout(45_000),
  }));
  const content = json.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) throw new Error("provider returned no content");
  return JSON.parse(content) as unknown;
}

async function callGemini(provider: ProviderConfig, system: string, user: string) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(provider.model)}:generateContent?key=${encodeURIComponent(provider.key)}`;
  const json = await readJson(await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: { temperature: 0, responseMimeType: "application/json" },
    }),
    signal: AbortSignal.timeout(45_000),
  }));
  const content = json.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("");
  if (typeof content !== "string" || !content.trim()) throw new Error("provider returned no content");
  return JSON.parse(content) as unknown;
}

export async function generateStructuredJSON(system: string, user: string) {
  for (const provider of configuredProviders()) {
    const runtime = runtimeFor(provider.name);
    if (runtime.unavailableUntil > Date.now()) continue;
    try {
      const result = provider.name === "gemini" ? await callGemini(provider, system, user) : await callOpenAICompatible(provider, system, user);
      runtime.failures = 0;
      runtime.unavailableUntil = 0;
      runtime.lastError = undefined;
      runtime.lastSuccessAt = new Date().toISOString();
      return { provider: provider.name, result };
    } catch (error) {
      runtime.failures += 1;
      runtime.unavailableUntil = Date.now() + Math.min(cooldownMaxMs, cooldownBaseMs * 2 ** Math.min(runtime.failures - 1, 3));
      runtime.lastError = error instanceof Error ? error.message : "unknown error";
      console.warn(`[ai] ${provider.name} failed; trying the next configured provider`, error instanceof Error ? error.message : "unknown error");
    }
  }
  return null;
}
