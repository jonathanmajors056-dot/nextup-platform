import assert from "node:assert/strict";
import { opportunities } from "../data/opportunities";
import { deriveLearningProfile, explainOpportunity, normalizeLearningEvent, scoreOpportunity } from "../lib/learning-engine";

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
assert.deepEqual(profile.seenOpportunityIds, ["orbit"]);
assert.ok(profile.opportunityWeights.orbit > 0);
assert.equal(profile.feedbackCount, 1);
assert.equal(profile.feedbackQuality, 100);
assert.match(profile.nextAction, /competition opportunity/i);

const competition = opportunities.find((opportunity) => opportunity.category === "Competition");
const workshop = opportunities.find((opportunity) => opportunity.category === "Workshop");
const neutral = opportunities.find((opportunity) => opportunity.id === "ai");
assert.ok(competition && workshop && neutral);
assert.ok(scoreOpportunity(workshop, profile) > 0);
assert.ok(scoreOpportunity(competition, profile) > scoreOpportunity(workshop, profile));

const negativeProfile = deriveLearningProfile([normalized, { ...normalized, value: "not-useful", timestamp: "2026-10-15T12:01:00.000Z" }]);
assert.ok(negativeProfile.opportunityWeights.orbit < profile.opportunityWeights.orbit);
assert.equal(negativeProfile.feedbackQuality, 50);
assert.match(explainOpportunity(competition, negativeProfile), /recent feedback/);

const recoveryProfile = deriveLearningProfile([
  normalized,
  { ...normalized, opportunityId: "climate", value: "not-useful", timestamp: "2026-10-15T12:01:00.000Z" },
  { ...normalized, opportunityId: "bio", value: "not-useful", timestamp: "2026-10-15T12:02:00.000Z" },
]);
assert.equal(recoveryProfile.feedbackQuality, 33);
assert.match(recoveryProfile.summary, /Broadening/);
assert.match(recoveryProfile.nextAction, /outside your current orbit/i);
assert.ok(scoreOpportunity(neutral, recoveryProfile) > scoreOpportunity(neutral, profile));

console.log("Learning engine checks passed.");
