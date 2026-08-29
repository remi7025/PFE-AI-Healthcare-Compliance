import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboard } from "../../context/DashboardContext";
import { THEME_COLORS, THEME_LABELS } from "../../constants";

function scoreColor(score: number): string {
  const t = score / 10;
  const r = Math.round(239 - t * (239 - 34));
  const g = Math.round(68 + t * (197 - 68));
  const b = Math.round(68 + t * (94 - 68));
  return `rgb(${r},${g},${b})`;
}

export function ThemesTab() {
  const { filtered, selectedThemes } = useDashboard();

  const heatRows = useMemo(
    () =>
      [...filtered]
        .sort((a, b) => a.country.localeCompare(b.country))
        .map((r) => ({ country: r.country, scores: r.scores })),
    [filtered],
  );

  const regionData = useMemo(() => {
    const regions = [...new Set(filtered.map((r) => r.region))].sort();
    return regions.map((region) => {
      const rows = filtered.filter((r) => r.region === region);
      const entry: Record<string, string | number> = { region };
      selectedThemes.forEach((key) => {
        const avg = rows.reduce((s, r) => s + r.scores[key], 0) / rows.length;
        entry[THEME_LABELS[key]] = Math.round(avg * 10) / 10;
      });
      return entry;
    });
  }, [filtered, selectedThemes]);

  const gapData = useMemo(
    () =>
      selectedThemes
        .map((key) => {
          const vals = filtered.map((r) => ({ country: r.country, score: r.scores[key] }));
          const max = Math.max(...vals.map((v) => v.score));
          const min = Math.min(...vals.map((v) => v.score));
          const leader = vals.find((v) => v.score === max)!.country;
          const laggard = vals.find((v) => v.score === min)!.country;
          return {
            theme: THEME_LABELS[key],
            max,
            min,
            gap: max - min,
            leader,
            laggard,
          };
        })
        .sort((a, b) => b.gap - a.gap),
    [filtered, selectedThemes],
  );

  if (!selectedThemes.length) {
    return <p className="text-slate-600">Select at least one theme from the sidebar.</p>;
  }

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-brand-900">Thematic Analysis Across Countries</h3>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-3 py-2 text-left font-semibold">Country</th>
              {selectedThemes.map((k) => (
                <th key={k} className="px-3 py-2 text-center font-semibold">
                  {THEME_LABELS[k]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heatRows.map((row) => (
              <tr key={row.country} className="border-t border-slate-100">
                <td className="px-3 py-2 font-medium">{row.country}</td>
                {selectedThemes.map((k) => (
                  <td
                    key={k}
                    className="px-3 py-2 text-center font-semibold text-white"
                    style={{ backgroundColor: scoreColor(row.scores[k]) }}
                  >
                    {row.scores[k]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section>
        <h4 className="mb-3 font-semibold">Average Theme Scores by Region</h4>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={regionData}>
              <XAxis dataKey="region" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Legend />
              {selectedThemes.map((key) => (
                <Bar
                  key={key}
                  dataKey={THEME_LABELS[key]}
                  fill={THEME_COLORS[THEME_LABELS[key]] ?? "#6366f1"}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h4 className="mb-2 font-semibold">Compliance Gap Analysis</h4>
        <p className="mb-3 text-sm text-slate-600">
          Gap between highest and lowest scoring country for each theme.
        </p>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Theme", "Max", "Leader", "Min", "Laggard", "Gap"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gapData.map((g) => (
                <tr key={g.theme} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-medium">{g.theme}</td>
                  <td className="px-3 py-2">{g.max}</td>
                  <td className="px-3 py-2">{g.leader}</td>
                  <td className="px-3 py-2">{g.min}</td>
                  <td className="px-3 py-2">{g.laggard}</td>
                  <td className="px-3 py-2 font-semibold text-indigo-600">{g.gap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
