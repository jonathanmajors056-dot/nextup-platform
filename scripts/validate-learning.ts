import assert from "node:assert/strict";
import { opportunities } from "../data/opportunities";
import { deriveLearningProfile, normalizeLearningEvent, scoreOpportunity } from "../lib/learning-engine";

const signal = { type: "feedback", opportunityId: "orbit", category: "Competition", format: "hybrid", tags: ["space", "team"], value: "useful", timestamp: "2026-10-15T12:00:00.000Z" };
const normalized = normalizeLearningEvent(signal);
assert.ok(normalized);
assert.deepEqual(normalized.tags, ["space", "team"]);
const malformedTags = normalizeLearningEvent({ ...signal, tags: "space team" });
assert.ok(malformedTags);
assert.deepEqual(malformedTags.tags, []);
assert.equal(normalizeLearningEvent({ ...signal, type: "unknown" }), null);

const profile = deriveLearningProfile([normalized]);
assert.equal(profile.totalSignals, 1);
assert.equal(profile.confidence, 8);
assert.ok(profile.topPreferences.includes("Competition"));

const competition = opportunities.find((opportunity) => opportunity.category === "Competition");
const workshop = opportunities.find((opportunity) => opportunity.category === "Workshop");
assert.ok(competition && workshop);
assert.ok(scoreOpportunity(workshop, profile) > 0);
assert.ok(scoreOpportunity(competition, profile) > scoreOpportunity(workshop, profile));

console.log("Learning engine checks passed.");
