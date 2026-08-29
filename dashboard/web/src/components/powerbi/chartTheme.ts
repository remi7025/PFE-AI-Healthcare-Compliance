import type { CountryRow, ThemeKey } from "../../types";
import { THEME_LABELS } from "../../constants";

/** Score color on 0–10 scale (green = high). */
export function scoreHeatColor(score: number): string {
  if (score >= 8) return "#059669";
  if (score >= 6) return "#06b6d4";
  if (score >= 4) return "#d9b300";
  return "#e66c37";
}

export function scoreHeatGlow(score: number): string {
  if (score >= 8) return "0 0 6px rgba(5,150,105,0.35)";
  if (score >= 6) return "0 0 6px rgba(6,182,212,0.35)";
  if (score >= 4) return "0 0 6px rgba(217,179,0,0.35)";
  return "0 0 6px rgba(230,108,55,0.35)";
}

export const PBI_COLORS = [
  "#118dff",
  "#7c3aed",
  "#06b6d4",
  "#059669",
  "#e66c37",
  "#e044a7",
  "#12239e",
  "#d9b300",
  "#744ec2",
  "#1aabba",
];

/** Solid fills for Recharts bars (SVG gradient urls are unreliable inside Recharts). */
export const PBI_FILLS = {
  blue: "#118dff",
  teal: "#06b6d4",
  purple: "#7c3aed",
  gold: "#e66c37",
  green: "#059669",
} as const;

export function regionAverages(
  rows: CountryRow[],
  themeKeys: ThemeKey[],
): { region: string; [theme: string]: string | number }[] {
  const regions = [...new Set(rows.map((r) => r.region))].sort();
  return regions.map((region) => {
    const subset = rows.filter((r) => r.region === region);
    const entry: { region: string; [key: string]: string | number } = { region };
    for (const key of themeKeys) {
      const label = THEME_LABELS[key];
      const avg = subset.reduce((s, r) => s + r.scores[key], 0) / subset.length;
      entry[label] = Math.round(avg * 10) / 10;
    }
    return entry;
  });
}

export function themeAverages(rows: CountryRow[], themeKeys: ThemeKey[]) {
  return themeKeys
    .map((key) => {
      const label = THEME_LABELS[key];
      const avg = rows.reduce((s, r) => s + r.scores[key], 0) / rows.length;
      return {
        theme: label.length > 12 ? label.slice(0, 11) + "…" : label,
        full: label,
        avg: Math.round(avg * 10) / 10,
      };
    })
    .sort((a, b) => b.avg - a.avg);
}
