import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboard } from "../../context/DashboardContext";
import { MATURITY_COLORS, THEME_LABELS } from "../../constants";

export function CompareTab() {
  const { filtered, selectedThemes } = useDashboard();
  const [selected, setSelected] = useState<string[]>(() =>
    filtered.slice(0, 4).map((r) => r.country),
  );

  const compareRows = filtered.filter((r) => selected.includes(r.country));

  const radarData = useMemo(() => {
    if (!selectedThemes.length) return [];
    return selectedThemes.map((key) => {
      const row: Record<string, string | number> = { theme: THEME_LABELS[key] };
      compareRows.forEach((c) => {
        row[c.country] = c.scores[key];
      });
      return row;
    });
  }, [compareRows, selectedThemes]);

  const toggle = (country: string) => {
    setSelected((prev) =>
      prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country],
    );
  };

  if (!filtered.length) {
    return <p className="text-slate-600">No countries match the current filters.</p>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-brand-900">Compare Countries Side-by-Side</h3>

      <div className="flex flex-wrap gap-2">
        {filtered.map((r) => (
          <button
            key={r.country}
            type="button"
            onClick={() => toggle(r.country)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              selected.includes(r.country)
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {r.country}
          </button>
        ))}
      </div>

      {compareRows.length === 0 ? (
        <p className="text-slate-600">Select at least one country to compare.</p>
      ) : (
        <>
          {selectedThemes.length > 0 && (
            <div className="card p-4">
              <div className="h-[420px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="theme" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis domain={[0, 10]} />
                    <Tooltip />
                    <Legend />
                    {compareRows.map((c, i) => (
                      <Radar
                        key={c.country}
                        name={c.country}
                        dataKey={c.country}
                        stroke={["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"][i % 5]}
                        fill={["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"][i % 5]}
                        fillOpacity={0.2}
                      />
                    ))}
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <h4 className="font-semibold">AI Devices Approved</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[...compareRows].sort((a, b) => a.aiDevicesApproved - b.aiDevicesApproved)}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <XAxis type="number" />
                <YAxis type="category" dataKey="country" width={120} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="aiDevicesApproved" radius={[0, 6, 6, 0]}>
                  {compareRows.map((r) => (
                    <Cell key={r.country} fill={MATURITY_COLORS[r.maturity] ?? "#6366f1"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h4 className="font-semibold">Regulatory Overview Table</h4>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  {[
                    "Country",
                    "Region",
                    "Maturity",
                    "Regulatory Body",
                    "Data Privacy Law",
                    "AI Regulation",
                    "Devices",
                    "First AI Reg",
                  ].map((h) => (
                    <th key={h} className="px-3 py-2 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...compareRows]
                  .sort((a, b) => a.country.localeCompare(b.country))
                  .map((r) => (
                    <tr key={r.country} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-2 font-medium">{r.country}</td>
                      <td className="px-3 py-2">{r.region}</td>
                      <td className="px-3 py-2">{r.maturity}</td>
                      <td className="max-w-xs px-3 py-2">{r.regulatoryBody}</td>
                      <td className="max-w-xs px-3 py-2">{r.dataPrivacyLaw}</td>
                      <td className="max-w-xs px-3 py-2">{r.aiRegulation}</td>
                      <td className="px-3 py-2">{r.aiDevicesApproved}</td>
                      <td className="px-3 py-2">{r.firstAiRegYear}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
