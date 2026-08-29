import { Download, Filter, SlidersHorizontal } from "lucide-react";
import { useDashboard } from "../../context/DashboardContext";
import { MATURITY_ORDER, THEME_KEYS, THEME_LABELS } from "../../constants";
import { exportCsv } from "../../lib/data";
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

  const csv = exportCsv(filtered, selectedThemes);
  const csvUrl = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));

  const activeFilters =
    selectedRegions.length + selectedMaturity.length + selectedThemes.length;

  return (
    <aside className="flex w-[230px] shrink-0 flex-col gap-2 overflow-y-auto border-r border-[#dde3ec] bg-gradient-to-b from-[#f8f9fc] to-[#eef1f6] p-3">
      <div className="mb-1 flex items-center gap-2 px-1">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-[#118dff] to-[#7c3aed] text-white shadow-md shadow-blue-500/25">
          <SlidersHorizontal className="h-3.5 w-3.5" />
        </div>
        <div>
          <p className="text-xs font-bold text-[#1a2332]">Filters</p>
          <p className="text-[10px] text-[#5c6578]">{activeFilters} active</p>
        </div>
      </div>

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

      <a
        href={csvUrl}
        download="filtered_compliance_dataset.csv"
        className="export-btn mt-auto flex items-center justify-center gap-2 rounded px-3 py-2.5 text-xs font-bold"
      >
        <Download className="h-4 w-4" />
        Export dataset
      </a>

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
      <div className="max-h-32 overflow-y-auto px-1 py-1">{children}</div>
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
