import { useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboard } from "../../context/DashboardContext";
import { MATURITY_COLORS, MATURITY_ORDER, THEME_LABELS } from "../../constants";
import { interpolateColor, overallScore } from "../../lib/data";
import { geoIso3 } from "../powerbi/chartHelpers";
import type { ThemeKey } from "../../types";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

type MapMetric = "overall" | "devices" | "year" | ThemeKey;

export function WorldMapTab() {
  const { filtered, selectedThemes } = useDashboard();
  const [metric, setMetric] = useState<MapMetric>("overall");

  const mapData = useMemo(() => {
    const rows = filtered.filter((r) => r.iso !== "EU");
    const values = rows.map((r) => {
      if (metric === "overall") return overallScore(r, selectedThemes);
      if (metric === "devices") return r.aiDevicesApproved;
      if (metric === "year") return r.firstAiRegYear;
      return r.scores[metric];
    });
    const min = Math.min(...values);
    const max = Math.max(...values);
    return {
      min,
      max,
      byIso: Object.fromEntries(
        rows.map((r, i) => [
          r.iso3,
          { ...r, value: values[i], color: interpolateColor(values[i], min, max) },
        ]),
      ),
    };
  }, [filtered, metric, selectedThemes]);

  const maturityData = MATURITY_ORDER.map((m) => ({
    maturity: m,
    count: filtered.filter((r) => r.maturity === m).length,
    fill: MATURITY_COLORS[m],
  })).filter((d) => d.count > 0);

  const metricOptions: { value: MapMetric; label: string }[] = [
    { value: "overall", label: "Overall Score" },
    { value: "devices", label: "AI Devices Approved" },
    { value: "year", label: "First AI Reg Year" },
    ...selectedThemes.map((k) => ({ value: k, label: THEME_LABELS[k] })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-semibold text-brand-900">
          Global AI Healthcare Regulatory Maturity
        </h3>
        <select
          value={metric}
          onChange={(e) => setMetric(e.target.value as MapMetric)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {metricOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {filtered.some((r) => r.iso === "EU") && (
        <p className="rounded-lg bg-indigo-50 px-4 py-2 text-sm text-indigo-800">
          Note: European Union is a regional aggregate and is excluded from the choropleth map.
          Individual EU member states in the dataset (e.g. Germany, UK, Switzerland) are shown.
        </p>
      )}

      <div className="card overflow-hidden p-2">
        <ComposableMap projection="geoEqualEarth" className="h-[420px] w-full">
          <ZoomableGroup>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const iso3 = geoIso3(geo.properties as Record<string, unknown>);
                  const entry = iso3 ? mapData.byIso[iso3] : undefined;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={entry?.color ?? "#e2e8f0"}
                      stroke="#fff"
                      strokeWidth={0.4}
                      style={{
                        default: { outline: "none" },
                        hover: { fill: entry ? "#4f46e5" : "#cbd5e1", outline: "none" },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      <div>
        <h4 className="mb-3 font-semibold text-slate-800">Regulatory Maturity Distribution</h4>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={maturityData}>
              <XAxis dataKey="maturity" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {maturityData.map((d) => (
                  <Cell key={d.maturity} fill={d.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
