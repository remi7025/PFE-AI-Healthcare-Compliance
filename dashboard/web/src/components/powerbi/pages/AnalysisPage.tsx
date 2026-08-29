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
import { useDashboard } from "../../../context/DashboardContext";
import { THEME_LABELS } from "../../../constants";
import { VisualTile } from "../VisualTile";
import { horizontalBarData } from "../chartHelpers";
import { PBI_COLORS, PBI_FILLS, scoreHeatColor } from "../chartTheme";

export function AnalysisPage() {
  const { filtered, selectedThemes } = useDashboard();

  const heatRows = useMemo(
    () => [...filtered].sort((a, b) => a.country.localeCompare(b.country)),
    [filtered],
  );

  const regionData = useMemo(() => {
    const regions = [...new Set(filtered.map((r) => r.region))].sort();
    return regions.map((region) => {
      const rows = filtered.filter((r) => r.region === region);
      const entry: Record<string, string | number> = { region };
      selectedThemes.forEach((key) => {
        entry[THEME_LABELS[key]] = Math.round(
          (rows.reduce((s, r) => s + r.scores[key], 0) / rows.length) * 10,
        ) / 10;
      });
      return entry;
    });
  }, [filtered, selectedThemes]);

  const gapData = useMemo(
    () =>
      selectedThemes
        .map((key) => {
          const vals = filtered.map((r) => r.scores[key]);
          const max = Math.max(...vals);
          const min = Math.min(...vals);
          return {
            theme: THEME_LABELS[key],
            gap: max - min,
            leader: filtered.find((r) => r.scores[key] === max)!.country,
            laggard: filtered.find((r) => r.scores[key] === min)!.country,
          };
        })
        .sort((a, b) => b.gap - a.gap),
    [filtered, selectedThemes],
  );

  if (!selectedThemes.length) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-sm text-[#605e5c]">
        Select at least one theme in the slicers panel.
      </div>
    );
  }

  return (
    <div className="grid h-full grid-cols-12 gap-3 p-3">
      <div className="col-span-12 lg:col-span-8">
        <VisualTile title="Theme score heatmap by country" accent="blue">
          <div className="max-h-[340px] overflow-auto">
            <table className="w-full text-[10px]">
              <thead className="sticky top-0 bg-[#faf9f8]">
                <tr>
                  <th className="border border-[#e1dfdd] px-2 py-1.5 text-left">Country</th>
                  {selectedThemes.map((k) => (
                    <th key={k} className="border border-[#e1dfdd] px-2 py-1.5">
                      {THEME_LABELS[k]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatRows.map((r) => (
                  <tr key={r.country}>
                    <td className="border border-[#e1dfdd] px-2 py-1 font-medium">
                      {r.country}
                    </td>
                    {selectedThemes.map((k) => (
                      <td
                        key={k}
                        className="border border-[#e1dfdd] px-2 py-1 text-center font-semibold text-white"
                        style={{ backgroundColor: scoreHeatColor(r.scores[k]) }}
                      >
                        {r.scores[k]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </VisualTile>
      </div>

      <div className="col-span-12 lg:col-span-4">
        <VisualTile title="Compliance gap by theme">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={horizontalBarData(gapData, "gap")} layout="vertical" margin={{ left: 8, right: 12 }}>
              <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="theme" width={100} tick={{ fontSize: 8 }} />
              <Tooltip />
              <Bar dataKey="gap" fill={PBI_FILLS.gold} barSize={14} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </VisualTile>
      </div>

      <div className="col-span-12">
        <VisualTile title="Average theme scores by region">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={regionData} margin={{ bottom: 8 }}>
              <XAxis dataKey="region" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} width={28} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              {selectedThemes.map((key, i) => (
                <Bar
                  key={key}
                  dataKey={THEME_LABELS[key]}
                  fill={PBI_COLORS[i % PBI_COLORS.length]}
                  barSize={16}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </VisualTile>
      </div>

      <div className="col-span-12">
        <VisualTile title="Gap analysis detail">
          <div className="max-h-[200px] overflow-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-[#faf9f8]">
                <tr>
                  {["Theme", "Gap", "Leader", "Laggard"].map((h) => (
                    <th key={h} className="border border-[#e1dfdd] px-3 py-2 text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gapData.map((g) => (
                  <tr key={g.theme}>
                    <td className="border border-[#e1dfdd] px-3 py-1.5">{g.theme}</td>
                    <td className="border border-[#e1dfdd] px-3 py-1.5 font-semibold text-[#118dff]">
                      {g.gap}
                    </td>
                    <td className="border border-[#e1dfdd] px-3 py-1.5">{g.leader}</td>
                    <td className="border border-[#e1dfdd] px-3 py-1.5">{g.laggard}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </VisualTile>
      </div>
    </div>
  );
}
