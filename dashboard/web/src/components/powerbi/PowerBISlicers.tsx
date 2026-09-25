import { Download, FileSpreadsheet, FileText, Filter, RotateCcw, SlidersHorizontal } from "lucide-react";
import { useDashboard } from "../../context/DashboardContext";
import { MATURITY_ORDER, THEME_KEYS, THEME_LABELS } from "../../constants";
import {
  downloadBlob,
  exportCountryPdfHtml,
  exportCsv,
  exportExcelXml,
} from "../../lib/export";
import type { ThemeKey } from "../../types";

export function PowerBISlicers() {
  const {
    allRegions,
    selectedRegions,
    setSelectedRegions,
    selectedMaturity,
    setSelectedMaturity,
    selectedThemes,
    setSelectedThemes,
    filtered,
    countries,
    setSelectedCountry,
    selectedCountry,
    rawWeights,
    themeWeights,
    setThemeWeight,
    resetThemeWeights,
    colorblind,
    setColorblind,
    getComposite,
  } = useDashboard();

  const toggleInList = (value: string, selected: string[], setter: (v: string[]) => void) => {
    setter(
      selected.includes(value) ? selected.filter((x) => x !== value) : [...selected, value],
    );
  };

  const toggleTheme = (key: ThemeKey) => {
    setSelectedThemes(
      selectedThemes.includes(key)
        ? selectedThemes.filter((t) => t !== key)
        : [...selectedThemes, key],
    );
  };

  const activeFilters =
    selectedRegions.length + selectedMaturity.length + selectedThemes.length;

  const onCsv = () => {
    const csv = exportCsv(filtered, selectedThemes, themeWeights);
    downloadBlob("filtered_compliance_dataset.csv", csv, "text/csv");
  };

  const onExcel = () => {
    const xml = exportExcelXml(filtered, selectedThemes, themeWeights);
    downloadBlob(
      "filtered_compliance_dataset.xls",
      xml,
      "application/vnd.ms-excel",
    );
  };

  const onPdf = () => {
    const row =
      (selectedCountry && countries.find((c) => c.country === selectedCountry)) ||
      filtered[0];
    if (!row) return;
    const html = exportCountryPdfHtml(row, getComposite(row));
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };

  return (
    <aside className="flex w-[250px] shrink-0 flex-col gap-2 overflow-y-auto border-r border-[#dde3ec] bg-gradient-to-b from-[#f8f9fc] to-[#eef1f6] p-3">
      <div className="mb-1 flex items-center gap-2 px-1">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-[#118dff] to-[#7c3aed] text-white shadow-md shadow-blue-500/25">
          <SlidersHorizontal className="h-3.5 w-3.5" />
        </div>
        <div>
          <p className="text-xs font-bold text-[#1a2332]">Filters</p>
          <p className="text-[10px] text-[#5c6578]">{activeFilters} active</p>
        </div>
      </div>

      <SlicerPanel title="Theme weights (live Sc)">
        <div className="space-y-2 px-2 pb-2">
          {THEME_KEYS.map((key) => (
            <div key={key}>
              <div className="mb-0.5 flex justify-between text-[9px] text-[#5c6578]">
                <span>{THEME_LABELS[key]}</span>
                <span className="font-mono">{Math.round(themeWeights[key] * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={rawWeights[key] ?? 0}
                onChange={(e) => setThemeWeight(key, Number(e.target.value))}
                className="w-full accent-[#118dff]"
                disabled={!selectedThemes.includes(key)}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={resetThemeWeights}
            className="flex w-full items-center justify-center gap-1 rounded border border-[#d0d7e2] bg-white py-1 text-[10px] text-[#3b4453] hover:border-[#118dff]"
          >
            <RotateCcw className="h-3 w-3" />
            Reset equal weights
          </button>
        </div>
      </SlicerPanel>

      <SlicerPanel title="Region" icon={Filter}>
        {allRegions.map((region) => (
          <SlicerItem
            key={region}
            label={region}
            checked={selectedRegions.includes(region)}
            onChange={() => toggleInList(region, selectedRegions, setSelectedRegions)}
          />
        ))}
      </SlicerPanel>

      <SlicerPanel title="Maturity">
        {MATURITY_ORDER.map((m) => (
          <SlicerItem
            key={m}
            label={m}
            checked={selectedMaturity.includes(m)}
            onChange={() => toggleInList(m, selectedMaturity, setSelectedMaturity)}
          />
        ))}
      </SlicerPanel>

      <SlicerPanel title="Theme">
        {THEME_KEYS.map((key) => (
          <SlicerItem
            key={key}
            label={THEME_LABELS[key]}
            checked={selectedThemes.includes(key)}
            onChange={() => toggleTheme(key)}
          />
        ))}
      </SlicerPanel>

      <SlicerPanel title="Country">
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="mx-2 mb-2 w-[calc(100%-16px)] border border-[#dde3ec] bg-white px-2 py-2 text-xs text-[#1a2332] shadow-sm transition focus:border-[#118dff] focus:outline-none focus:ring-2 focus:ring-[#118dff]/20"
        >
          <option value="">All countries</option>
          {[...countries]
            .sort((a, b) => a.country.localeCompare(b.country))
            .map((c) => (
              <option key={c.country} value={c.country}>
                {c.country}
              </option>
            ))}
        </select>
      </SlicerPanel>

      <SlicerPanel title="Accessibility">
        <SlicerItem
          label="Color-blind palettes"
          checked={colorblind}
          onChange={() => setColorblind(!colorblind)}
        />
      </SlicerPanel>

      <div className="mt-auto space-y-1.5">
        <button
          type="button"
          onClick={onCsv}
          className="export-btn flex w-full items-center justify-center gap-2 rounded px-3 py-2 text-xs font-bold"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
        <button
          type="button"
          onClick={onExcel}
          className="flex w-full items-center justify-center gap-2 rounded border border-[#118dff] bg-white px-3 py-2 text-xs font-bold text-[#118dff] hover:bg-[#eef6ff]"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          Export Excel
        </button>
        <button
          type="button"
          onClick={onPdf}
          className="flex w-full items-center justify-center gap-2 rounded border border-[#059669] bg-white px-3 py-2 text-xs font-bold text-[#059669] hover:bg-[#ecfdf5]"
        >
          <FileText className="h-3.5 w-3.5" />
          PDF country dossier
        </button>
      </div>

      <p className="px-1 text-center text-[9px] leading-relaxed text-[#a0a8b8]">
        Supervisor: Dr. Anuradha Kar
        <br />
        FDA · EMA · WHO · OECD
      </p>
    </aside>
  );
}

function SlicerPanel({
  title,
  children,
  icon: Icon,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="pbi-slicer-panel">
      <div className="pbi-slicer-title flex items-center gap-1.5">
        {Icon && <Icon className="h-3 w-3" />}
        {title}
      </div>
      <div className="max-h-40 overflow-y-auto px-1 py-1">{children}</div>
    </div>
  );
}

function SlicerItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className={`pbi-slicer-item ${checked ? "checked" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 shrink-0 rounded accent-[#118dff]"
      />
      <span className={checked ? "text-[#1a2332]" : "text-[#8a929e]"}>{label}</span>
    </label>
  );
}
