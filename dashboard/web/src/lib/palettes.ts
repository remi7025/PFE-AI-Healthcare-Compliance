/** Color-blind accessible palettes (ColorBrewer / Viridis-inspired). */
export const ACCESSIBLE = {
  /** Sequential (low→high) — Viridis-like */
  viridis: ["#440154", "#414487", "#2a788e", "#22a884", "#7ad151", "#fde725"],
  /** Diverging for gaps / deltas — ColorBrewer RdYlBu */
  diverging: ["#d73027", "#fc8d59", "#fee090", "#e0f3f8", "#91bfdb", "#4575b4"],
  /** Qualitative categorical — ColorBrewer Set2, colorblind-safe-ish */
  categorical: [
    "#66c2a5",
    "#fc8d62",
    "#8da0cb",
    "#e78ac3",
    "#a6d854",
    "#ffd92f",
    "#e5c494",
    "#b3b3b3",
  ],
  /** High-contrast text on dark */
  textOnDark: "#f8fafc",
  textOnLight: "#0f172a",
} as const;

export function scoreColorAccessible(score: number, colorblind = true): string {
  const t = Math.max(0, Math.min(1, score / 10));
  const pal = colorblind ? ACCESSIBLE.viridis : ["#ef4444", "#f59e0b", "#22c55e"];
  if (!colorblind) {
    if (score >= 8) return "#059669";
    if (score >= 6) return "#06b6d4";
    if (score >= 4) return "#d9b300";
    return "#e66c37";
  }
  const idx = Math.min(pal.length - 1, Math.floor(t * (pal.length - 1)));
  return pal[idx];
}

export function deltaColor(delta: number): string {
  if (delta > 0.5) return "#2166ac";
  if (delta < -0.5) return "#b2182b";
  return "#6b7280";
}
