import type { CountryRow, ThemeKey } from "../types";
import { THEME_KEYS } from "../constants";

/** Equal default weights (sum = 1). */
export function equalWeights(keys: ThemeKey[] = THEME_KEYS): Record<ThemeKey, number> {
  const w = 1 / keys.length;
  return Object.fromEntries(keys.map((k) => [k, w])) as Record<ThemeKey, number>;
}

/** Weighted composite score Sc_w for a country. */
export function weightedComposite(
  row: CountryRow,
  weights: Partial<Record<ThemeKey, number>>,
  keys: ThemeKey[] = THEME_KEYS,
): number {
  let num = 0;
  let den = 0;
  for (const k of keys) {
    const w = weights[k] ?? 0;
    if (w <= 0) continue;
    num += row.scores[k] * w;
    den += w;
  }
  if (den <= 0) return 0;
  return Math.round((num / den) * 100) / 100;
}

/** Normalize slider values (0–100) to weights summing to 1. */
export function normalizeWeights(
  raw: Partial<Record<ThemeKey, number>>,
  keys: ThemeKey[] = THEME_KEYS,
): Record<ThemeKey, number> {
  const vals = keys.map((k) => Math.max(0, raw[k] ?? 0));
  const sum = vals.reduce((a, b) => a + b, 0);
  if (sum <= 0) return equalWeights(keys);
  return Object.fromEntries(keys.map((k, i) => [k, vals[i] / sum])) as Record<
    ThemeKey,
    number
  >;
}

export function rankByWeightedScore(
  rows: CountryRow[],
  weights: Partial<Record<ThemeKey, number>>,
  keys: ThemeKey[] = THEME_KEYS,
): { country: string; score: number; devices: number; rank: number }[] {
  return [...rows]
    .map((r) => ({
      country: r.country,
      score: weightedComposite(r, weights, keys),
      devices: r.aiDevicesApproved,
    }))
    .sort((a, b) => b.score - a.score)
    .map((r, i) => ({ ...r, rank: i + 1 }));
}

export function scoreDelta(
  a: CountryRow,
  b: CountryRow,
  keys: ThemeKey[] = THEME_KEYS,
): { key: ThemeKey; a: number; b: number; delta: number }[] {
  return keys.map((key) => ({
    key,
    a: a.scores[key],
    b: b.scores[key],
    delta: Math.round((a.scores[key] - b.scores[key]) * 10) / 10,
  }));
}
