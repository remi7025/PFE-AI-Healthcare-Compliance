import type { CountryRow } from "../types";

export interface RagChunk {
  id: string;
  source: string;
  jurisdiction: string;
  theme: string;
  text: string;
}

export interface RagCitation {
  id: string;
  source: string;
  jurisdiction: string;
  theme: string;
  score: number;
  snippet: string;
}

export interface RagResult {
  answer: string;
  citations: RagCitation[];
  latencyMs: number;
  mode: "hybrid-lexical";
}

const STOP = new Set(
  "a an the and or of to in on for with by from as is are was were be been being this that these those it its into about over under than then so if what which who how when where why can could should would may might will shall not no yes do does did done have has had having".split(
    " ",
  ),
);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

function tfScore(queryToks: string[], docToks: string[]): number {
  if (!queryToks.length || !docToks.length) return 0;
  const freq = new Map<string, number>();
  for (const t of docToks) freq.set(t, (freq.get(t) ?? 0) + 1);
  let score = 0;
  for (const q of queryToks) {
    const f = freq.get(q) ?? 0;
    if (f > 0) score += 1 + Math.log(1 + f);
  }
  // Prefer denser matches
  return score / Math.sqrt(docToks.length);
}

/** Build a lightweight offline corpus from country narratives + literature. */
export function buildCorpus(countries: CountryRow[], literature: string): RagChunk[] {
  const chunks: RagChunk[] = [];

  for (const c of countries) {
    const fields: Array<[string, string]> = [
      ["data_privacy", c.dataGovernance],
      ["clinical_validation", c.clinicalValidation],
      ["approval_process", c.approvalProcess],
      ["transparency", c.algorithmicTransparency],
      ["ethics", c.ethicalFramework],
      ["post_market", c.postMarketSurveillance],
      ["liability", c.liability],
    ];
    for (const [theme, text] of fields) {
      if (!text?.trim()) continue;
      chunks.push({
        id: `${c.iso}::${theme}`,
        source: `${c.country} curated narrative`,
        jurisdiction: c.country,
        theme,
        text: `${c.country} (${c.region}, ${c.maturity}). ${theme.replace(/_/g, " ")}: ${text}. Key laws: ${c.keyLegislations}. Devices: ${c.aiDevicesApproved}.`,
      });
    }
    if (c.notableDevelopments) {
      chunks.push({
        id: `${c.iso}::notable`,
        source: `${c.country} notable developments`,
        jurisdiction: c.country,
        theme: "overview",
        text: `${c.country}: ${c.notableDevelopments}. Challenges: ${c.challenges}`,
      });
    }
  }

  // Literature paragraphs as chunks
  const paras = literature
    .split(/\n{2,}/)
    .map((p) => p.replace(/^#+\s*/gm, "").trim())
    .filter((p) => p.length > 80);
  paras.slice(0, 80).forEach((p, i) => {
    chunks.push({
      id: `lit::${i}`,
      source: "Thematic literature review",
      jurisdiction: "Multi",
      theme: "literature",
      text: p.slice(0, 900),
    });
  });

  return chunks;
}

function synthesizeAnswer(question: string, hits: RagCitation[]): string {
  if (!hits.length) {
    return "Insufficient evidence in the local corpus for this question. Try naming a jurisdiction (e.g., EU, USA, Japan) or a theme (privacy, transparency, liability). This assistant does not provide legal advice.";
  }
  const top = hits.slice(0, 3);
  const lines = [
    `Grounded answer (offline hybrid-lexical RAG demo) for: “${question.trim()}”`,
    "",
    "Based on the highest-ranked curated passages:",
  ];
  top.forEach((h, i) => {
    lines.push(
      `${i + 1}. [${h.id}] ${h.jurisdiction} / ${h.theme}: ${h.snippet.slice(0, 220)}${h.snippet.length > 220 ? "…" : ""}`,
    );
  });
  lines.push(
    "",
    "Citations are drawn only from the project corpus (country narratives + literature). Scores are research indicators, not official ratings or legal advice. For score changes, a human curator must confirm any HITL update.",
  );
  return lines.join("\n");
}

/** Offline RAG: lexical retrieval + grounded synthesis (defence demo). */
export function runRagQuery(
  question: string,
  corpus: RagChunk[],
  opts?: { k?: number; theme?: string; jurisdiction?: string },
): RagResult {
  const t0 = performance.now();
  const k = opts?.k ?? 6;
  const qToks = tokenize(question);

  let candidates = corpus;
  if (opts?.theme && opts.theme !== "all") {
    candidates = candidates.filter((c) => c.theme === opts.theme || c.theme === "literature");
  }
  if (opts?.jurisdiction && opts.jurisdiction !== "all") {
    const j = opts.jurisdiction.toLowerCase();
    candidates = candidates.filter(
      (c) =>
        c.jurisdiction.toLowerCase().includes(j) ||
        c.jurisdiction === "Multi" ||
        c.text.toLowerCase().includes(j),
    );
  }

  const scored = candidates
    .map((c) => {
      const dToks = tokenize(c.text);
      let score = tfScore(qToks, dToks);
      // Boost exact phrase / jurisdiction mentions
      const ql = question.toLowerCase();
      if (c.jurisdiction !== "Multi" && ql.includes(c.jurisdiction.toLowerCase())) score += 1.5;
      if (ql.includes(c.theme.replace(/_/g, " "))) score += 0.6;
      return { chunk: c, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);

  const citations: RagCitation[] = scored.map(({ chunk, score }) => ({
    id: chunk.id,
    source: chunk.source,
    jurisdiction: chunk.jurisdiction,
    theme: chunk.theme,
    score: Math.round(score * 100) / 100,
    snippet: chunk.text,
  }));

  return {
    answer: synthesizeAnswer(question, citations),
    citations,
    latencyMs: Math.round(performance.now() - t0),
    mode: "hybrid-lexical",
  };
}
