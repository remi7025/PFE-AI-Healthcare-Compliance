import { useMemo } from "react";
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
import { useDashboard } from "../../../context/DashboardContext";
import { MATURITY_COLORS, THEME_LABELS } from "../../../constants";
import { VisualTile } from "../VisualTile";
import { horizontalBarData } from "../chartHelpers";
import { PBI_COLORS } from "../chartTheme";

export function ComparisonPage() {
  const { filtered, selectedThemes, compareCountries, setCompareCountries } =
    useDashboard();

  const compareRows = filtered.filter((r) => compareCountries.includes(r.country));

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

  const deviceBarData = useMemo(
    () =>
      horizontalBarData(
        compareRows.map((r) => ({
          country: r.country,
          aiDevicesApproved: r.aiDevicesApproved,
          maturity: r.maturity,
        })),
        "aiDevicesApproved",
      ),
    [compareRows],
  );

  const toggle = (country: string) => {
    setCompareCountries(
      compareCountries.includes(country)
        ? compareCountries.filter((c) => c !== country)
        : [...compareCountries, country],
    );
  };

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <div className="pbi-slicer shrink-0 px-3 py-2">
        <span className="text-[11px] font-semibold uppercase text-[#605e5c]">
          Select countries to compare
        </span>
        <div className="mt-2 flex flex-wrap gap-1">
          {filtered.map((r) => (
            <button
              key={r.country}
              type="button"
              onClick={() => toggle(r.country)}
              className={`border px-2 py-0.5 text-[11px] ${
                compareCountries.includes(r.country)
                  ? "border-[#118dff] bg-[#118dff] text-white"
                  : "border-[#e1dfdd] bg-white text-[#605e5c] hover:border-[#118dff]"
              }`}
            >
              {r.country}
            </button>
          ))}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-12 gap-2">
        <div className="col-span-12 lg:col-span-6">
          <VisualTile title="Theme comparison radar">
            {compareRows.length && selectedThemes.length ? (
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#edebe9" />
                  <PolarAngleAxis dataKey="theme" tick={{ fontSize: 9 }} />
                  <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 9 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  {compareRows.map((c, i) => (
                    <Radar
                      key={c.country}
                      name={c.country}
                      dataKey={c.country}
                      stroke={PBI_COLORS[i % PBI_COLORS.length]}
                      fill={PBI_COLORS[i % PBI_COLORS.length]}
                      fillOpacity={0.15}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <p className="p-4 text-xs text-[#605e5c]">Select countries and themes.</p>
            )}
          </VisualTile>
        </div>

        <div className="col-span-12 lg:col-span-6">
          <VisualTile title="AI devices approved">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={deviceBarData}
                layout="vertical"
                margin={{ left: 8, right: 16 }}
              >
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="country" width={90} tick={{ fontSize: 9 }} />
                <Tooltip />
                <Bar dataKey="aiDevicesApproved" barSize={16}>
                  {deviceBarData.map((r) => (
                    <Cell key={r.country} fill={MATURITY_COLORS[r.maturity] ?? "#118dff"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </VisualTile>
        </div>

        <div className="col-span-12">
          <VisualTile title="Regulatory overview table">
            <div className="max-h-[240px] overflow-auto">
              <table className="w-full text-[11px]">
                <thead className="sticky top-0 bg-[#faf9f8]">
                  <tr>
                    {[
                      "Country",
                      "Region",
                      "Maturity",
                      "Regulatory Body",
                      "Privacy Law",
                      "AI Regulation",
                      "Devices",
                    ].map((h) => (
                      <th key={h} className="border border-[#e1dfdd] px-2 py-1.5 text-left">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...compareRows]
                    .sort((a, b) => a.country.localeCompare(b.country))
                    .map((r) => (
                      <tr key={r.country} className="hover:bg-[#faf9f8]">
                        <td className="border border-[#e1dfdd] px-2 py-1 font-medium">
                          {r.country}
                        </td>
                        <td className="border border-[#e1dfdd] px-2 py-1">{r.region}</td>
                        <td className="border border-[#e1dfdd] px-2 py-1">{r.maturity}</td>
                        <td className="max-w-[140px] border border-[#e1dfdd] px-2 py-1">
                          {r.regulatoryBody}
                        </td>
                        <td className="max-w-[120px] border border-[#e1dfdd] px-2 py-1">
                          {r.dataPrivacyLaw}
                        </td>
                        <td className="max-w-[140px] border border-[#e1dfdd] px-2 py-1">
                          {r.aiRegulation}
                        </td>
                        <td className="border border-[#e1dfdd] px-2 py-1">
                          {r.aiDevicesApproved}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </VisualTile>
        </div>
      </div>
    </div>
  );
}
