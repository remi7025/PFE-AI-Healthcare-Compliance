import clsx from "clsx";
import { Download, Filter, Github, Info } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { MATURITY_ORDER, THEME_KEYS, THEME_LABELS } from "../constants";
import { exportCsv } from "../lib/data";
import type { ThemeKey } from "../types";

export function Sidebar() {
  const {
    allRegions,
    selectedRegions,
    setSelectedRegions,
    selectedMaturity,
    setSelectedMaturity,
    selectedThemes,
    setSelectedThemes,
    filtered,
  } = useDashboard();

  const toggleRegion = (region: string) => {
    setSelectedRegions(
      selectedRegions.includes(region)
        ? selectedRegions.filter((r) => r !== region)
        : [...selectedRegions, region],
    );
  };

  const toggleMaturity = (m: string) => {
    setSelectedMaturity(
      selectedMaturity.includes(m)
        ? selectedMaturity.filter((x) => x !== m)
        : [...selectedMaturity, m],
    );
  };

  const toggleTheme = (key: ThemeKey) => {
    setSelectedThemes(
      selectedThemes.includes(key)
        ? selectedThemes.filter((t) => t !== key)
        : [...selectedThemes, key],
    );
  };

  const csv = exportCsv(filtered, selectedThemes);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const csvUrl = URL.createObjectURL(blob);

  return (
    <aside className="flex w-full shrink-0 flex-col gap-6 border-b border-slate-200 bg-white/80 p-5 backdrop-blur lg:w-72 lg:border-b-0 lg:border-r lg:min-h-screen">
      <div className="flex items-center gap-2 text-brand-900">
        <Filter className="h-5 w-5 text-indigo-600" />
        <h2 className="text-lg font-bold">Filters</h2>
      </div>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Regions
        </h3>
        <div className="flex flex-wrap gap-2">
          {allRegions.map((region) => (
            <button
              key={region}
              type="button"
              onClick={() => toggleRegion(region)}
              className={clsx(
                "rounded-full px-3 py-1 text-xs font-medium transition",
                selectedRegions.includes(region)
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200",
              )}
            >
              {region}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Maturity Level
        </h3>
        <div className="space-y-1">
          {MATURITY_ORDER.map((m) => (
            <label key={m} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedMaturity.includes(m)}
                onChange={() => toggleMaturity(m)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              {m}
            </label>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Themes
        </h3>
        <div className="space-y-1">
          {THEME_KEYS.map((key) => (
            <label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedThemes.includes(key)}
                onChange={() => toggleTheme(key)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              {THEME_LABELS[key]}
            </label>
          ))}
        </div>
      </section>

      <a
        href={csvUrl}
        download="filtered_compliance_dataset.csv"
        className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:bg-indigo-700"
      >
        <Download className="h-4 w-4" />
        Download CSV
      </a>

      <section className="mt-auto space-y-3 border-t border-slate-200 pt-4 text-sm text-slate-600">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
          <p>
            Compare AI healthcare compliance across 20 countries. Supervisor:{" "}
            <strong>Dr. Anuradha Kar</strong>
          </p>
        </div>
        <a
          href="https://github.com/remi7025/AI-Healthcare-Compliance-Dashboard"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-indigo-600 hover:underline"
        >
          <Github className="h-4 w-4" />
          View on GitHub
        </a>
        <p className="text-xs text-slate-400">
          Sources: FDA, EMA, WHO, OECD, national agencies, peer-reviewed literature
        </p>
      </section>
    </aside>
  );
}
