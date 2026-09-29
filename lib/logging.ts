type LogLevel = "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

function errorFields(error: unknown) {
  if (error instanceof Error) return { error: error.message, stack: error.stack };
  return { error: String(error) };
}

export function requestId(request: Request) {
  return request.headers.get("x-vercel-id") ?? request.headers.get("x-request-id") ?? crypto.randomUUID();
}

export function logEvent(level: LogLevel, event: string, context: LogContext = {}) {
  const payload = { timestamp: new Date().toISOString(), level, event, ...context };
  if (level === "error") console.error(JSON.stringify(payload));
  else if (level === "warn") console.warn(JSON.stringify(payload));
  else console.log(JSON.stringify(payload));
}

export async function withRequestLogging(
  request: Request,
  route: string,
  handler: (context: { requestId: string }) => Promise<Response>,
) {
  const id = requestId(request);
  const startedAt = Date.now();
  logEvent("info", "request.started", { route, requestId: id, method: request.method });
  try {
    const response = await handler({ requestId: id });
    logEvent("info", "request.completed", { route, requestId: id, method: request.method, status: response.status, durationMs: Date.now() - startedAt });
    return response;
  } catch (error) {
    logEvent("error", "request.failed", { route, requestId: id, method: request.method, durationMs: Date.now() - startedAt, ...errorFields(error) });
    throw error;
  }
}

export function logError(event: string, error: unknown, context: LogContext = {}) {
  logEvent("error", event, { ...context, ...errorFields(error) });
}

