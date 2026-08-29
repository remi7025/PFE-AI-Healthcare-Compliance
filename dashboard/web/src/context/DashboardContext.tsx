import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CountryRow, GlobalTrend, KeyReference, ThemeKey } from "../types";
import { THEME_KEYS } from "../constants";
import { loadDataset, loadLiteratureReview, toCountryRow } from "../lib/data";
import { MATURITY_ORDER } from "../constants";
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
  setSelectedThemes: (v: ThemeKey[]) => void;
  selectedCountry: string;
  setSelectedCountry: (v: string) => void;
  compareCountries: string[];
  setCompareCountries: (v: string[]) => void;
  activePage: PowerBIPage;
  setActivePage: (p: PowerBIPage) => void;
  filtered: CountryRow[];
  allRegions: string[];
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
  const [activePage, setActivePage] = useState<PowerBIPage>("overview");

  useEffect(() => {
    Promise.all([loadDataset(), loadLiteratureReview()])
      .then(([data, lit]) => {
        const rows = data.countries.map(toCountryRow);
        setCountries(rows);
        setTrends(data.global_trends);
        setReferences(data.key_references);
        setLiterature(lit);
        setSelectedRegions([...new Set(rows.map((r) => r.region))].sort());
        setCompareCountries(rows.slice(0, 4).map((r) => r.country));
        setLoading(false);
      })
      .catch((e: Error) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const allRegions = useMemo(
    () => [...new Set(countries.map((c) => c.region))].sort(),
    [countries],
  );

  const filtered = useMemo(
    () =>
      countries.filter(
        (c) =>
          selectedRegions.includes(c.region) && selectedMaturity.includes(c.maturity),
      ),
    [countries, selectedRegions, selectedMaturity],
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
    setSelectedThemes,
    selectedCountry,
    setSelectedCountry,
    compareCountries,
    setCompareCountries,
    activePage,
    setActivePage,
    filtered,
    allRegions,
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
