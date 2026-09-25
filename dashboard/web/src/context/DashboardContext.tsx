import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CountryRow, GlobalTrend, KeyReference, ThemeKey } from "../types";
import { THEME_KEYS, MATURITY_ORDER } from "../constants";
import { loadDataset, loadLiteratureReview, toCountryRow } from "../lib/data";
import { validateDataset } from "../lib/schema";
import { normalizeWeights, weightedComposite } from "../lib/weights";
import { useUrlSync, type UrlState } from "../lib/urlState";
import type { PowerBIPage } from "../components/powerbi/PowerBIHeader";

interface DashboardState {
  loading: boolean;
  error: string | null;
  countries: CountryRow[];
  trends: GlobalTrend[];
  references: KeyReference[];
  literature: string;
  selectedRegions: string[];
  setSelectedRegions: (v: string[]) => void;
  selectedMaturity: string[];
  setSelectedMaturity: (v: string[]) => void;
  selectedThemes: ThemeKey[];
  setSelectedThemes: (v: string[] | ThemeKey[]) => void;
  selectedCountry: string;
  setSelectedCountry: (v: string) => void;
  compareCountries: string[];
  setCompareCountries: (v: string[]) => void;
  diffA: string;
  setDiffA: (v: string) => void;
  diffB: string;
  setDiffB: (v: string) => void;
  activePage: PowerBIPage;
  setActivePage: (p: PowerBIPage) => void;
  rawWeights: Record<ThemeKey, number>;
  themeWeights: Record<ThemeKey, number>;
  setThemeWeight: (key: ThemeKey, value: number) => void;
  resetThemeWeights: () => void;
  colorblind: boolean;
  setColorblind: (v: boolean) => void;
  ragQuery: string;
  setRagQuery: (v: string) => void;
  yearRange: [number, number];
  setYearRange: (v: [number, number]) => void;
  filtered: CountryRow[];
  allRegions: string[];
  getComposite: (row: CountryRow) => number;
}

const DashboardContext = createContext<DashboardState | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countries, setCountries] = useState<CountryRow[]>([]);
  const [trends, setTrends] = useState<GlobalTrend[]>([]);
  const [references, setReferences] = useState<KeyReference[]>([]);
  const [literature, setLiterature] = useState("");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedMaturity, setSelectedMaturity] = useState<string[]>([...MATURITY_ORDER]);
  const [selectedThemes, setSelectedThemes] = useState<ThemeKey[]>([...THEME_KEYS]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [compareCountries, setCompareCountries] = useState<string[]>([]);
  const [diffA, setDiffA] = useState("");
  const [diffB, setDiffB] = useState("");
  const [activePage, setActivePage] = useState<PowerBIPage>("overview");
  const [rawWeights, setRawWeights] = useState<Record<ThemeKey, number>>(() =>
    Object.fromEntries(THEME_KEYS.map((k) => [k, 100 / THEME_KEYS.length])) as Record<
      ThemeKey,
      number
    >,
  );
  const [colorblind, setColorblind] = useState(true);
  const [ragQuery, setRagQuery] = useState("");
  const [yearRange, setYearRange] = useState<[number, number]>([2017, 2026]);

  useEffect(() => {
    Promise.all([loadDataset(), loadLiteratureReview()])
      .then(([raw, lit]) => {
        const data = validateDataset(raw);
        const rows = data.countries.map(toCountryRow);
        setCountries(rows);
        setTrends(data.global_trends);
        setReferences(data.key_references);
        setLiterature(lit);
        setSelectedRegions([...new Set(rows.map((r) => r.region))].sort());
        setCompareCountries(rows.slice(0, 4).map((r) => r.country));
        setDiffA(rows[0]?.country ?? "");
        setDiffB(rows[1]?.country ?? "");
        setLoading(false);
      })
      .catch((e: Error) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const themeWeights = useMemo(
    () => normalizeWeights(rawWeights, selectedThemes),
    [rawWeights, selectedThemes],
  );

  const setThemeWeight = useCallback((key: ThemeKey, value: number) => {
    setRawWeights((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetThemeWeights = useCallback(() => {
    setRawWeights(
      Object.fromEntries(THEME_KEYS.map((k) => [k, 100 / THEME_KEYS.length])) as Record<
        ThemeKey,
        number
      >,
    );
  }, []);

  const applyUrl = useCallback((partial: Partial<UrlState>) => {
    if (partial.activePage) setActivePage(partial.activePage);
    if (partial.selectedRegions?.length) setSelectedRegions(partial.selectedRegions);
    if (partial.selectedMaturity?.length) setSelectedMaturity(partial.selectedMaturity);
    if (partial.selectedThemes?.length) setSelectedThemes(partial.selectedThemes);
    if (partial.selectedCountry) setSelectedCountry(partial.selectedCountry);
    if (partial.compareCountries?.length) setCompareCountries(partial.compareCountries);
    if (partial.query) setRagQuery(partial.query);
    if (partial.colorblind !== undefined) setColorblind(partial.colorblind);
  }, []);

  useUrlSync(
    {
      activePage,
      selectedRegions,
      selectedMaturity,
      selectedThemes,
      selectedCountry,
      compareCountries,
      query: ragQuery,
      colorblind,
    },
    applyUrl,
    !loading && !error,
  );

  const allRegions = useMemo(
    () => [...new Set(countries.map((c) => c.region))].sort(),
    [countries],
  );

  const filtered = useMemo(
    () =>
      countries.filter(
        (c) =>
          selectedRegions.includes(c.region) &&
          selectedMaturity.includes(c.maturity),
      ),
    [countries, selectedRegions, selectedMaturity],
  );

  const getComposite = useCallback(
    (row: CountryRow) => weightedComposite(row, themeWeights, selectedThemes),
    [themeWeights, selectedThemes],
  );

  const value: DashboardState = {
    loading,
    error,
    countries,
    trends,
    references,
    literature,
    selectedRegions,
    setSelectedRegions,
    selectedMaturity,
    setSelectedMaturity,
    selectedThemes,
    setSelectedThemes: (v) => setSelectedThemes(v as ThemeKey[]),
    selectedCountry,
    setSelectedCountry,
    compareCountries,
    setCompareCountries,
    diffA,
    setDiffA,
    diffB,
    setDiffB,
    activePage,
    setActivePage,
    rawWeights,
    themeWeights,
    setThemeWeight,
    resetThemeWeights,
    colorblind,
    setColorblind,
    ragQuery,
    setRagQuery,
    yearRange,
    setYearRange,
    filtered,
    allRegions,
    getComposite,
  };

  return (
    <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
