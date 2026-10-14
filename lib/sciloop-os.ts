export type SciLoopPortal = {
  id: string;
  name: string;
  eyebrow: string;
  description: string;
  promise: string;
  href: string;
  accent: string;
  keywords: string[];
  outputs: string[];
};

export const sciloopPortals: SciLoopPortal[] = [
  {
    id: "live-innovations",
    name: "Live Innovations",
    eyebrow: "Evaluate what is emerging",
    description:
      "Scans live science and technology signals, separates evidence from hype, and recommends the next useful investigation.",
    promise: "See not only what is new, but how strong the signal is, what remains uncertain, and what to do next.",
    href: "/live-innovations",
    accent: "cyan",
    keywords: ["live", "innovation", "news", "emerging", "hype", "signal", "breakthrough"],
    outputs: ["future lens", "evidence score", "next action"],
  },
  {
    id: "knowledge-frontier",
    name: "Knowledge Frontier",
    eyebrow: "Understand the edge",
    description:
      "Tracks frontier ideas, scientist legacies, invention timelines, and the methods that move knowledge forward.",
    promise: "Turn scattered facts into a connected map of what humanity knows and what remains unknown.",
    href: "/knowledge-frontier",
    accent: "violet",
    keywords: ["frontier", "scientist", "history", "invention", "research", "unknown"],
    outputs: ["frontier map", "breakthrough timeline", "open questions"],
  },
  {
    id: "visual-language",
    name: "Visual Language",
    eyebrow: "See the mechanism",
    description:
      "Translates forces, systems, biology, feedback, scale, and change into controlled visual explanations.",
    promise: "Make an invisible mechanism visible without sacrificing its scientific structure.",
    href: "/visual-language",
    accent: "cyan",
    keywords: ["visual", "diagram", "mechanism", "explain", "biology", "physics", "show"],
    outputs: ["visual recipe", "semantic graph", "causal explanation"],
  },
  {
    id: "mini-experiment",
    name: "Mini Experiment Lab",
    eyebrow: "Change the variables",
    description:
      "Runs browser-native experiments and Reality Sandbox worlds where variables can be changed and consequences observed.",
    promise: "Learn by touching the model: change a variable, watch the world respond, and inspect why.",
    href: "/mini-experiment-lab",
    accent: "emerald",
    keywords: ["experiment", "simulate", "simulation", "variable", "sandbox", "test", "model"],
    outputs: ["interactive model", "before/after state", "observed consequence"],
  },
  {
    id: "local-problem",
    name: "Local Problem Solver",
    eyebrow: "Convert insight into impact",
    description:
      "Frames local problems, global challenges, community solutions, and measurable contribution in one workflow.",
    promise: "Move from a real-world problem to structured options, trade-offs, and an action path.",
    href: "/local-problem-solver",
    accent: "amber",
    keywords: ["problem", "local", "community", "impact", "solution", "climate", "action"],
    outputs: ["problem map", "solution comparison", "impact path"],
  },
  {
    id: "discoveries",
    name: "Discoveries",
    eyebrow: "Start from a breakthrough",
    description:
      "Opens curated discoveries as world changes with typed concepts, narratives, and reusable simulation transitions.",
    promise: "Start with a discovery and follow the chain from evidence to mechanism to changed reality.",
    href: "/discoveries",
    accent: "rose",
    keywords: ["discovery", "breakthrough", "news", "evidence", "researcher", "world change"],
    outputs: ["discovery brief", "concept network", "world transition"],
  },
  {
    id: "sciloop-ai",
    name: "SciLoop Reasoning",
    eyebrow: "Ask the system",
    description:
      "Streams explanations, plans, code, and scientific reasoning while keeping the user in control of the next step.",
    promise: "Turn a raw question into a structured plan that can be explained, visualized, simulated, or acted on.",
    href: "/sciloop-ai-stream",
    accent: "blue",
    keywords: ["ask", "reason", "plan", "code", "chat", "question", "compare"],
    outputs: ["reasoning trace", "next action", "structured answer"],
  },
];

export function routeSciLoopIntent(input: string): SciLoopPortal {
  const normalized = input.trim().toLowerCase();
  if (!normalized) return sciloopPortals[5];

  const ranked = sciloopPortals
    .map((portal) => ({
      portal,
      score: portal.keywords.reduce(
        (score, keyword) => score + (normalized.includes(keyword) ? 1 : 0),
        0,
      ),
    }))
    .sort((a, b) => b.score - a.score);

  return ranked[0].score > 0 ? ranked[0].portal : sciloopPortals[5];
}
