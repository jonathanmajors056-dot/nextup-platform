import http from "k6/http";
import { check } from "k6";
import { Rate, Trend } from "k6/metrics";

const baseUrl = (__ENV.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const targetRps = Number(__ENV.LOAD_RPS || 50);
const duration = __ENV.LOAD_DURATION || "2m";

const apiDuration = new Trend("nextup_api_duration", true);
const pageDuration = new Trend("nextup_page_duration", true);
const applicationErrors = new Rate("nextup_application_errors");

export const options = {
  scenarios: {
    launch_read_mix: {
      executor: "constant-arrival-rate",
      rate: targetRps,
      timeUnit: "1s",
      duration,
      preAllocatedVUs: Math.max(20, Math.ceil(targetRps * 1.5)),
      maxVUs: Math.max(100, targetRps * 5),
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    nextup_application_errors: ["rate<0.01"],
    nextup_api_duration: ["p(95)<800"],
    nextup_page_duration: ["p(95)<1500"],
  },
};

function loadReadMix() {
  const isApiRequest = Math.random() < 0.8;
  const response = isApiRequest
    ? http.get(`${baseUrl}/api/opportunities?limit=24`, { tags: { endpoint: "opportunities" } })
    : http.get(`${baseUrl}/`, { tags: { endpoint: "home" } });

  if (isApiRequest) apiDuration.add(response.timings.duration);
  else pageDuration.add(response.timings.duration);

  const healthy = check(response, {
    "response is successful": (res) => res.status >= 200 && res.status < 400,
    "response is not empty": (res) => res.body && res.body.length > 0,
    ...(isApiRequest ? { "opportunities response is JSON": (res) => res.headers["Content-Type"]?.includes("application/json") } : {}),
  });
  applicationErrors.add(!healthy);
}

export default loadReadMix;
