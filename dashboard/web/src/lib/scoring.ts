import type { CountryRow, ThemeKey } from "../types";
import { USE_CASE_WEIGHTS } from "../constants";

export function computeReadiness(
  row: CountryRow,
  weights: Partial<Record<ThemeKey, number>>,
  selectedThemes: ThemeKey[],
): number {
  const filtered = Object.entries(weights).filter(([k]) =>
    selectedThemes.includes(k as ThemeKey),
  ) as [ThemeKey, number][];
  const wSum = filtered.reduce((s, [, w]) => s + w, 0);
  if (wSum <= 0) return 0;
  const weighted = filtered.reduce((s, [k, w]) => s + row.scores[k] * w, 0);
  return Math.round((weighted / wSum) * 100) / 100;
}

export function computeAllReadiness(
  rows: CountryRow[],
  selectedThemes: ThemeKey[],
): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (const [useCase, weights] of Object.entries(USE_CASE_WEIGHTS)) {
    result[useCase] = rows.map((r) => computeReadiness(r, weights, selectedThemes));
  }
  return result;
}

export function countKeywordMentions(text: string): { topic: string; mentions: number }[] {
  const lower = text.toLowerCase();
  const groups: [string, string[]][] = [
    ["Radiology", ["radiology", "radiograph", "radiographs", "x-ray", "xray", "chest radiographs"]],
    ["Pathology", ["pathology", "digital pathology", "histopathology"]],
    ["Genomics", ["genomics", "genomic"]],
    ["Drug Discovery / Development", ["drug discovery", "drug development", "clinical trials"]],
    ["Hospitals / Clinics", ["hospital", "clinics", "clinic", "clinical setting", "hospitals"]],
    ["Public Health", ["public health", "surveillance", "outbreak"]],
    ["Generative AI / Foundation Models", ["generative", "foundation model", "foundation models"]],
  ];

  const countPhrase = (phrase: string) => {
    const p = phrase.toLowerCase().trim();
    if (!p) return 0;
    if (p.includes(" ")) return lower.split(p).length - 1;
    const re = new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
    return (lower.match(re) ?? []).length;
  };

  return groups
    .map(([topic, phrases]) => ({
      topic,
      mentions: phrases.reduce((sum, p) => sum + countPhrase(p), 0),
    }))
    .sort((a, b) => b.mentions - a.mentions);
}
