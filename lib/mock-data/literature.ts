import type { LiteratureStatus, LiteratureQueryResult } from "@/lib/types";

export const emptyLiteratureStatus: LiteratureStatus = {
  documents: 0,
  indexed: 0,
  status: "not_indexed",
  lastIndexedAt: null,
};

interface MockAnswer {
  keywords: string[];
  answer: string;
  citations: LiteratureQueryResult["citations"];
}

const mockAnswers: MockAnswer[] = [
  {
    keywords: ["electrolyte", "bath", "composition"],
    answer:
      "Across the indexed corpus, the most frequently reported electrolytes for plasma electrolytic oxidation (PEO/MAO) coatings on magnesium are alkaline silicate and phosphate baths. Common formulations include Na2SiO3·9H2O (10–25 g/L), Na3PO4·12H2O (5–20 g/L), and KOH or NaOH (2–10 g/L) used as pH stabilizers. Alkaline fluoride additives (KF) appear in roughly a third of reports.",
    citations: [
      { paperId: "2021-014", page: "3", metric: "Table 1 — bath compositions" },
      { paperId: "2022-089", page: "5", metric: "Methods §2.1" },
      { paperId: "2020-041", page: "7", metric: "Table 2" },
    ],
  },
  {
    keywords: ["current densit", "cd", "ampere", "a/dm"],
    answer:
      "Reported current densities for Mg coating processes cluster between 1 and 20 A/dm². Unipolar pulsed modes typically use 3–8 A/dm², while higher-density regimes (10–20 A/dm²) appear in papers optimizing coating thickness at the cost of increased porosity. Constant-current anodizing studies more commonly cite 0.5–2 A/dm².",
    citations: [
      { paperId: "2021-014", page: "4", metric: "Fig. 2 — CD range" },
      { paperId: "2019-112", page: "9", metric: "Results" },
    ],
  },
  {
    keywords: ["porosity", "lower", "dense", "compact"],
    answer:
      "Lower porosity was consistently associated with: (1) moderate current densities (3–6 A/dm²) rather than extremes; (2) higher pulse frequencies (≥1000 Hz) which refine spark distribution; (3) shorter processing times (<15 min) that limit pore coalescence; and (4) silicate-rich electrolytes. Porosity below 3% was most frequently reported at duty cycles near 40–50%.",
    citations: [
      { paperId: "2022-089", page: "6", metric: "Fig. 4 — porosity vs duty cycle" },
      { paperId: "2020-041", page: "8", metric: "Discussion" },
    ],
  },
  {
    keywords: ["thickness", "thick"],
    answer:
      "Coating thicknesses reported for Mg range from roughly 5 to 120 μm. Growth follows a near-parabolic law with processing time: ~10 μm at 5 min, 20–45 μm at 10–15 min, saturating around 60–90 μm beyond 30 min depending on electrolyte conductivity. Voltage (above ~350 V) strongly accelerates growth but increases defect density.",
    citations: [
      { paperId: "2019-112", page: "10", metric: "Fig. 5 — growth kinetics" },
      { paperId: "2021-014", page: "6", metric: "Table 3" },
    ],
  },
  {
    keywords: ["compare", "across", "different", "contrast"],
    answer:
      "Comparing the indexed papers: silicate baths produce denser, thinner coatings with better corrosion scores, whereas phosphate baths grow thicker coatings at slightly higher porosity. Aluminate baths sit between the two. Pulse mode (vs DC) consistently lowers porosity by 1–3 points while reducing growth rate. Two papers note frequency and duty cycle are the strongest controls on pore morphology.",
    citations: [
      { paperId: "2022-089", page: "8", metric: "Comparative table" },
      { paperId: "2020-041", page: "9", metric: "Conclusions" },
    ],
  },
];

const fallbackAnswer: LiteratureQueryResult = {
  id: "",
  answer:
    "The indexed knowledge base does not yet contain a response that directly matches this question. Once the literature ingestion pipeline (LangChain/LlamaIndex + vector store) is connected and papers are indexed, I will be able to answer with source citations. For now this is a demonstration response.",
  citations: [],
  demo: true,
};

let queryCounter = 0;

export function mockLiteratureQuery(question: string): LiteratureQueryResult {
  queryCounter += 1;
  const lower = question.toLowerCase();
  const match = mockAnswers.find((m) => m.keywords.some((k) => lower.includes(k)));
  const base = match ?? fallbackAnswer;
  return {
    id: `lit-${Date.now()}-${queryCounter}`,
    answer: base.answer,
    citations: base.citations,
    demo: true,
  };
}
