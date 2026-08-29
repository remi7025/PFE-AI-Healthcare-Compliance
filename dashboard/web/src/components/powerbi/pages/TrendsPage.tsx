import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboard } from "../../../context/DashboardContext";
import { ADOPTION_COLORS, USE_CASE_WEIGHTS } from "../../../constants";
import { computeAllReadiness } from "../../../lib/scoring";
import { VisualTile } from "../VisualTile";
import { horizontalBarData } from "../chartHelpers";
import { PBI_COLORS, scoreHeatColor } from "../chartTheme";

export function TrendsPage() {
  const { filtered, selectedThemes, trends } = useDashboard();
  const useCases = Object.keys(USE_CASE_WEIGHTS);
  const [focus, setFocus] = useState(useCases[0]);

  const readiness = useMemo(
    () => computeAllReadiness(filtered, selectedThemes),
    [filtered, selectedThemes],
  );

  const ranking = useMemo(() => {
    const scores = readiness[focus] ?? [];
    const rows = filtered.map((r, i) => ({
      country: r.country,
      readiness: scores[i] ?? 0,
    }));
    const top = [...rows].sort((a, b) => b.readiness - a.readiness).slice(0, 12);
    return horizontalBarData(top, "readiness");
  }, [filtered, focus, readiness]);

  const timeline = useMemo(
    () =>
      horizontalBarData(
        filtered.map((r) => ({
          country: r.country,
          firstAiRegYear: r.firstAiRegYear,
        })),
        "firstAiRegYear",
      ),
    [filtered],
  );

  return (
    <div className="grid h-full grid-cols-12 gap-3 p-3">
      <div className="col-span-12 lg:col-span-7">
        <VisualTile title="First AI regulation timeline">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={timeline} layout="vertical" margin={{ left: 4, right: 16, top: 4, bottom: 4 }}>
              <XAxis
                type="number"
                dataKey="firstAiRegYear"
                domain={["dataMin - 1", "dataMax + 1"]}
                tick={{ fontSize: 10 }}
              />
              <YAxis type="category" dataKey="country" width={100} tick={{ fontSize: 9 }} />
              <Tooltip formatter={(v: number) => [v, "First regulation year"]} />
              <Bar dataKey="firstAiRegYear" fill="#118dff" barSize={12} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </VisualTile>
      </div>

      <div className="col-span-12 lg:col-span-5">
        <VisualTile title="Global regulatory trends">
          <div className="max-h-[260px] space-y-2 overflow-y-auto pr-1">
            {trends.map((t) => (
              <div
                key={t.trend}
                className="border border-[#e1dfdd] bg-[#faf9f8] px-3 py-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-[#252423]">{t.trend}</p>
                  <span
                    className="shrink-0 px-1.5 py-0.5 text-[9px] font-bold text-white"
                    style={{
                      backgroundColor: ADOPTION_COLORS[t.adoption_level] ?? "#605e5c",
                    }}
                  >
                    {t.adoption_level}
                  </span>
                </div>
                <p className="mt-1 text-[10px] leading-snug text-[#605e5c]">
                  {t.description}
                </p>
                <p className="mt-1 text-[9px] text-[#a19f9d]">Since {t.year_emerged}</p>
              </div>
            ))}
          </div>
        </VisualTile>
      </div>

      <div className="col-span-12 lg:col-span-7">
        <VisualTile title="AI use-case readiness heatmap" subtitle="Derived from theme scores">
          <div className="max-h-[220px] overflow-auto">
            <table className="w-full text-[10px]">
              <thead className="sticky top-0 bg-[#faf9f8]">
                <tr>
                  <th className="border border-[#e1dfdd] px-2 py-1 text-left">Country</th>
                  {useCases.map((uc) => (
                    <th key={uc} className="border border-[#e1dfdd] px-1 py-1">
                      {uc.split("/")[0].trim().slice(0, 12)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, ri) => (
                  <tr key={r.country}>
                    <td className="border border-[#e1dfdd] px-2 py-0.5 font-medium">
                      {r.country}
                    </td>
                    {useCases.map((uc) => (
                      <td
                        key={uc}
                        className="border border-[#e1dfdd] px-1 py-0.5 text-center font-semibold text-white"
                        style={{
                          backgroundColor: scoreHeatColor(readiness[uc][ri]),
                        }}
                      >
                        {readiness[uc][ri].toFixed(1)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </VisualTile>
      </div>

      <div className="col-span-12 lg:col-span-5">
        <VisualTile
          title="Use-case country ranking"
          headerExtra={
            <select
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              className="border border-[#e1dfdd] bg-white px-1 py-0.5 text-[10px]"
            >
              {useCases.map((uc) => (
                <option key={uc} value={uc}>
                  {uc}
                </option>
              ))}
            </select>
          }
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ranking} layout="vertical" margin={{ left: 4, right: 12 }}>
              <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="country" width={88} tick={{ fontSize: 9 }} />
              <Tooltip formatter={(v: number) => [`${v}/10`, "Readiness"]} />
              <Bar dataKey="readiness" barSize={12}>
                {ranking.map((row, i) => (
                  <Cell key={row.country} fill={PBI_COLORS[i % PBI_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </VisualTile>
      </div>
    </div>
  );
}
