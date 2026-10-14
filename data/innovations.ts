export type InnovationRecord = {
  slug: string;
  title: string;
  field: string;
  date: string;
  source: string;
  summary: string;
  facts: string[];
  mechanism: string;
  scientists: { name: string; role: string }[];
  organizations: string[];
  timeline: { year: string; label: string; detail: string }[];
  technology: { label: string; detail: string }[];
  related: string[];
  futures: { label: string; detail: string; tone: "positive" | "caution" | "open" }[];
  evidence: { label: string; url: string; publisher: string; publishedAt: string }[];
  decision: {
    whyItMatters: string;
    affectedCapability: string;
    confidence: "Reviewed signal" | "Emerging evidence";
    nextAction: "Watch" | "Validate" | "Run experiment" | "No action yet";
    researchQuestion: string;
  };
};

export const innovations: InnovationRecord[] = [
  {
    slug: "google-quantum-chip",
    title: "Google’s quantum chip points toward a new era of computation",
    field: "Quantum computing",
    date: "Live today",
    source: "Google Quantum AI · reviewed primary source",
    summary: "A new generation of quantum processors is pushing error correction from an abstract promise toward an engineering discipline. The breakthrough is not just more qubits: it is the ability to preserve useful information while the machine is noisy.",
    facts: ["Error correction is the central scaling challenge", "Logical qubits are built from many physical qubits", "Useful applications still require major engineering progress"],
    mechanism: "Quantum information is encoded across a protected lattice of physical qubits. When noise flips part of the state, repeated checks detect the pattern without directly reading the answer, allowing the system to correct errors while the computation continues.",
    scientists: [{ name: "Google Quantum AI", role: "Processor and error-correction research" }, { name: "John Preskill", role: "Quantum information theory" }, { name: "Peter Shor", role: "Quantum error-correction foundations" }],
    organizations: ["Google Quantum AI", "University research labs", "Quantum hardware ecosystem"],
    timeline: [{ year: "1994", label: "The algorithmic promise", detail: "Shor shows how a quantum computer could factor large numbers." }, { year: "2019", label: "Early advantage", detail: "Quantum processors demonstrate a task beyond practical classical reach." }, { year: "2023", label: "Error correction focus", detail: "The field shifts from raw qubit counts to reliable logical qubits." }, { year: "Today", label: "The engineering test", detail: "Researchers work toward scalable, fault-tolerant machines." }],
    technology: [{ label: "Physical qubits", detail: "Noisy hardware elements that hold quantum states." }, { label: "Syndrome checks", detail: "Measurements that reveal errors without revealing the computation." }, { label: "Logical qubit", detail: "A protected computational unit assembled from many physical qubits." }],
    related: ["Topological materials", "Cryptography after quantum", "Optimization and simulation"],
    futures: [{ label: "Best case", detail: "Fault-tolerant machines accelerate chemistry, materials, and drug discovery.", tone: "positive" }, { label: "Caution", detail: "Hardware complexity and error rates may keep useful systems years away.", tone: "caution" }, { label: "Open question", detail: "Which problems will deliver value before the hardware becomes universal?", tone: "open" }],
    evidence: [{ label: "Making quantum error correction work", url: "https://research.google/blog/making-quantum-error-correction-work/", publisher: "Google Research", publishedAt: "December 9, 2024" }],
    decision: { whyItMatters: "Error correction is the gating capability between impressive quantum demonstrations and reliable multi-step computation.", affectedCapability: "Computational chemistry and materials R&D", confidence: "Reviewed signal", nextAction: "Watch", researchQuestion: "Which R&D problems become economically useful first as logical-qubit reliability improves?" },
  },
  {
    slug: "crispr-gene-editing",
    title: "CRISPR turned a microbial defense into a programmable tool",
    field: "Synthetic biology",
    date: "2012 → today",
    source: "Nobel Prize · reviewed primary source",
    summary: "CRISPR-based systems let researchers target specific genetic sequences and modify them with unprecedented precision. Its significance is both technical and social: biology became more programmable, while questions of safety and access became impossible to ignore.",
    facts: ["CRISPR uses guide sequences to find a target", "Gene editing can disable, repair, or rewrite DNA", "Clinical uses require careful delivery and safety testing"],
    mechanism: "A guide RNA directs a molecular complex to a matching DNA sequence. An attached enzyme makes a cut or chemical edit, and the cell’s own repair machinery completes the change.",
    scientists: [{ name: "Jennifer Doudna", role: "CRISPR mechanism and applications" }, { name: "Emmanuelle Charpentier", role: "Guide RNA and bacterial immune systems" }, { name: "Feng Zhang", role: "Mammalian genome editing" }],
    organizations: ["Broad Institute", "UC Berkeley", "Max Planck Institute"],
    timeline: [{ year: "1987", label: "Strange repeats", detail: "Repeated DNA sequences are observed in bacteria." }, { year: "2012", label: "A programmable tool", detail: "Researchers show CRISPR-Cas9 can be directed to cut chosen DNA." }, { year: "2020", label: "Recognition", detail: "The Nobel Prize in Chemistry recognizes the method." }, { year: "Today", label: "From lab to clinic", detail: "Therapies begin moving from experimental systems toward patients." }],
    technology: [{ label: "Guide RNA", detail: "The programmable address for finding a DNA target." }, { label: "Cas enzyme", detail: "The molecular machine that cuts or edits the target." }, { label: "Delivery", detail: "The unresolved engineering problem of reaching the right cells safely." }],
    related: ["Personalized medicine", "Agricultural biotechnology", "Synthetic cells"],
    futures: [{ label: "Best case", detail: "Treatments become precise, durable, and accessible for inherited disease.", tone: "positive" }, { label: "Caution", detail: "Off-target edits, delivery, and unequal access remain serious constraints.", tone: "caution" }, { label: "Open question", detail: "How should society govern edits that can pass to future generations?", tone: "open" }],
    evidence: [{ label: "Nobel Prize in Chemistry 2020 press release", url: "https://www.nobelprize.org/prizes/chemistry/2020/press-release/", publisher: "Nobel Prize", publishedAt: "October 7, 2020" }],
    decision: { whyItMatters: "Programmable editing changed the speed and range of biological research, while delivery and safety remain decisive constraints.", affectedCapability: "Therapeutic and platform-biology R&D", confidence: "Reviewed signal", nextAction: "Validate", researchQuestion: "Which delivery, safety, and access constraints determine whether a CRISPR application can leave the lab?" },
  },
  {
    slug: "solid-state-battery",
    title: "Solid-state batteries could redraw the map of energy storage",
    field: "Energy systems",
    date: "Live today",
    source: "U.S. Department of Energy · reviewed technical source",
    summary: "Replacing a liquid electrolyte with a solid one could make batteries safer and potentially more energy dense. The remaining challenge is manufacturing a material system that stays stable over thousands of cycles at scale.",
    facts: ["Solid electrolytes can reduce flammability", "Energy density depends on the full cell design", "Manufacturing yield is as important as laboratory performance"],
    mechanism: "During discharge, ions move through an electrolyte between electrodes while electrons travel through the external circuit. A solid electrolyte changes the transport and interface problem, creating both new opportunities and new failure modes.",
    scientists: [{ name: "John B. Goodenough", role: "Lithium-ion battery foundations" }, { name: "Maria Helena Braga", role: "Glass and solid electrolyte research" }, { name: "Battery engineering teams", role: "Scale-up and reliability" }],
    organizations: ["Automotive manufacturers", "Battery startups", "National laboratories"],
    timeline: [{ year: "1970s", label: "Lithium enters the story", detail: "Early research establishes lithium as a powerful battery material." }, { year: "1991", label: "Commercial lithium-ion", detail: "Rechargeable lithium-ion batteries enter consumer products." }, { year: "2010s", label: "The solid-state race", detail: "Companies begin targeting safer, higher-density architectures." }, { year: "Today", label: "Scale is the question", detail: "Pilot lines test whether performance can survive manufacturing." }],
    technology: [{ label: "Cathode", detail: "The positive electrode that stores and releases lithium ions." }, { label: "Solid electrolyte", detail: "The ion-conducting material replacing flammable liquid." }, { label: "Anode", detail: "The negative electrode where energy is stored during charging." }],
    related: ["Grid storage", "Electric mobility", "Renewable energy"],
    futures: [{ label: "Best case", detail: "Safer, lighter storage accelerates electric transport and renewable grids.", tone: "positive" }, { label: "Caution", detail: "Cost, material supply, and manufacturing defects may slow adoption.", tone: "caution" }, { label: "Open question", detail: "Can a laboratory advantage become a durable global supply chain?", tone: "open" }],
    evidence: [{ label: "Advanced processing for novel battery electrode architectures", url: "https://www1.eere.energy.gov/vehiclesandfuels/downloads/2023_AMR/bat164_Li_2023_o%20-%20jianlin%20li.pdf", publisher: "U.S. Department of Energy", publishedAt: "2023" }],
    decision: { whyItMatters: "Energy-storage performance has value only if interfaces, yield, cost, and supply can survive manufacturing scale.", affectedCapability: "Energy storage and electrification strategy", confidence: "Emerging evidence", nextAction: "Validate", researchQuestion: "Which material-interface failure mode most constrains cycle life and manufacturing yield at pilot scale?" },
  },
];

export function getInnovation(slug: string) {
  return innovations.find((innovation) => innovation.slug === slug);
}

export function slugifyInnovation(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
