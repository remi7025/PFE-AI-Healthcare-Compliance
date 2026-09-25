import { useEffect, useRef } from "react";
import type { PowerBIPage } from "../components/powerbi/PowerBIHeader";
import type { ThemeKey } from "../types";
import { THEME_KEYS } from "../constants";
import { MATURITY_ORDER } from "../constants";

export interface UrlState {
  activePage: PowerBIPage;
  selectedRegions: string[];
  selectedMaturity: string[];
  selectedThemes: ThemeKey[];
  selectedCountry: string;
  compareCountries: string[];
  query: string;
  colorblind: boolean;
}

const PAGE_IDS: PowerBIPage[] = [
  "overview",
  "analysis",
  "comparison",
  "diff",
  "trends",
  "details",
  "rag",
  "literature",
];

function parseList(v: string | null): string[] {
  if (!v) return [];
  return v.split(",").map((s) => s.trim()).filter(Boolean);
}

export function readUrlState(): Partial<UrlState> {
  if (typeof window === "undefined") return {};
  const sp = new URLSearchParams(window.location.search);
  const page = sp.get("tab") as PowerBIPage | null;
  const themes = parseList(sp.get("themes")).filter((t): t is ThemeKey =>
    THEME_KEYS.includes(t as ThemeKey),
  );
  const maturity = parseList(sp.get("maturity"));
  const regions = parseList(sp.get("region"));
  return {
    activePage: page && PAGE_IDS.includes(page) ? page : undefined,
    selectedRegions: regions.length ? regions : undefined,
    selectedMaturity: maturity.length ? maturity : undefined,
    selectedThemes: themes.length ? themes : undefined,
    selectedCountry: sp.get("country") ?? undefined,
    compareCountries: parseList(sp.get("compare")),
    query: sp.get("q") ?? undefined,
    colorblind: sp.get("cb") === "1",
  };
}

export function writeUrlState(state: UrlState) {
  if (typeof window === "undefined") return;
  const sp = new URLSearchParams();
  sp.set("tab", state.activePage);
  if (state.selectedRegions.length) sp.set("region", state.selectedRegions.join(","));
  if (state.selectedMaturity.length && state.selectedMaturity.length < MATURITY_ORDER.length) {
    sp.set("maturity", state.selectedMaturity.join(","));
  }
  if (state.selectedThemes.length && state.selectedThemes.length < THEME_KEYS.length) {
    sp.set("themes", state.selectedThemes.join(","));
  }
  if (state.selectedCountry) sp.set("country", state.selectedCountry);
  if (state.compareCountries.length) sp.set("compare", state.compareCountries.join(","));
  if (state.query) sp.set("q", state.query);
  if (state.colorblind) sp.set("cb", "1");
  const next = `${window.location.pathname}?${sp.toString()}${window.location.hash}`;
  window.history.replaceState(null, "", next);
}

/** Sync dashboard state ↔ URL query params (shareable links). */
export function useUrlSync(
  state: UrlState,
  apply: (partial: Partial<UrlState>) => void,
  ready: boolean,
) {
  const applied = useRef(false);

  useEffect(() => {
    if (!ready || applied.current) return;
    const fromUrl = readUrlState();
    apply(fromUrl);
    applied.current = true;
  }, [ready, apply]);

  useEffect(() => {
    if (!ready || !applied.current) return;
    writeUrlState(state);
  }, [state, ready]);
}
