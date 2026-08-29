import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { Activity, Cpu, Globe, Layers, Shield } from "lucide-react";
import { useDashboard } from "../../../context/DashboardContext";
import { MATURITY_COLORS, MATURITY_ORDER, THEME_LABELS } from "../../../constants";
import { interpolateColor, overallScore } from "../../../lib/data";
import { InsightStrip } from "../InsightStrip";
import { KpiTile, VisualTile } from "../VisualTile";
import { geoIso3, horizontalBarData } from "../chartHelpers";
import { PBI_COLORS, PBI_FILLS, scoreHeatColor, scoreHeatGlow, themeAverages } from "../chartTheme";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const CHART_H = 240;

export function OverviewPage() {
  const { filtered, selectedThemes } = useDashboard();

  const stats = useMemo(() => {
    const devices = filtered.reduce((s, r) => s + r.aiDevicesApproved, 0);
    const avg =
      selectedThemes.length && filtered.length
        ? (
            filtered.reduce((s, r) => s + overallScore(r, selectedThemes), 0) /
            filtered.length
          ).toFixed(1)
        : "—";
    const advanced = filtered.filter((r) => r.maturity === "Advanced").length;
    return { devices, avg, advanced, count: filtered.length };
  }, [filtered, selectedThemes]);

  const topCountries = useMemo(() => {
    const rows = filtered.map((r) => ({
      country: r.country,
      score: overallScore(r, selectedThemes),
    }));
    return horizontalBarData(
      rows.sort((a, b) => b.score - a.score).slice(0, 8),
      "score",
    );
  }, [filtered, selectedThemes]);

  const mapLookup = useMemo(() => {
    const mapRows = filtered.filter((r) => r.iso !== "EU");
    const values = mapRows.map((r) => overallScore(r, selectedThemes));
    const min = values.length ? Math.min(...values) : 0;
    const max = values.length ? Math.max(...values) : 10;
    const byIso: Record<string, { color: string; value: number; name: string }> = {};
    for (const r of mapRows) {
      const score = overallScore(r, selectedThemes);
      byIso[r.iso3] = {
        color: interpolateColor(score, min, max),
        value: score,
        name: r.country,
      };
    }
    return { byIso };
  }, [filtered, selectedThemes]);

  const maturityData = MATURITY_ORDER.map((m) => ({
    name: m,
    value: filtered.filter((r) => r.maturity === m).length,
  })).filter((d) => d.value > 0);

  const themeAvg = useMemo(
    () => themeAverages(filtered, selectedThemes),
    [filtered, selectedThemes],
  );

  const regionDevices = useMemo(
    () =>
      Object.entries(
        filtered.reduce<Record<string, number>>((acc, r) => {
          acc[r.region] = (acc[r.region] ?? 0) + r.aiDevicesApproved;
          return acc;
        }, {}),
      )
        .map(([region, devices]) => ({ region, devices }))
        .sort((a, b) => b.devices - a.devices),
    [filtered],
  );

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <KpiTile label="Countries in view" value={String(stats.count)} icon={Globe}
          gradient="linear-gradient(135deg, #118dff, #06b6d4)" glow="rgba(17,141,255,0.25)" />
        <KpiTile label="Avg compliance" value={`${stats.avg}/10`} icon={Shield}
          gradient="linear-gradient(135deg, #7c3aed, #118dff)" glow="rgba(124,58,237,0.25)" />
        <KpiTile label="AI devices approved" value={stats.devices.toLocaleString()} icon={Cpu}
          gradient="linear-gradient(135deg, #12239e, #744ec2)" glow="rgba(18,35,158,0.25)" />
        <KpiTile label="Advanced maturity" value={String(stats.advanced)} icon={Activity}
          gradient="linear-gradient(135deg, #059669, #06b6d4)" glow="rgba(5,150,105,0.25)" />
        <KpiTile label="Regions tracked"
          value={String(new Set(filtered.map((r) => r.region)).size)} icon={Layers}
          gradient="linear-gradient(135deg, #e66c37, #f2c811)" glow="rgba(230,108,55,0.25)" />
      </div>

      <InsightStrip />

      <div className="grid min-h-0 flex-1 grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-5">
          <VisualTile title="Global regulatory maturity" subtitle="Overall score (1–10)" accent="blue">
            <div className="map-container" style={{ height: CHART_H }}>
              <ComposableMap projection="geoEqualEarth" className="h-full w-full">
                <ZoomableGroup>
                  <Geographies geography={GEO_URL}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const iso3 = geoIso3(geo.properties as Record<string, unknown>);
                        const entry = iso3 ? mapLookup.byIso[iso3] : undefined;
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={entry?.color ?? "#e8ecf2"}
                            stroke="#fff"
                            strokeWidth={0.4}
                            style={{
                              default: { outline: "none" },
                              hover: {
                                fill: entry ? "#118dff" : "#d0d5dd",
                                outline: "none",
                              },
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
            <p className="mt-1 text-center text-[9px] text-[#8a929e]">
              EU is an aggregate in data · member states colored individually
            </p>
          </VisualTile>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <VisualTile title="Top performers" subtitle="Highest compliance scores" accent="teal">
            <ResponsiveContainer width="100%" height={CHART_H}>
              <BarChart data={topCountries} layout="vertical" margin={{ left: 4, right: 24, top: 4, bottom: 4 }}>
                <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 10, fill: "#5c6578" }} />
                <YAxis type="category" dataKey="country" width={96} tick={{ fontSize: 9, fill: "#5c6578" }} />
                <Tooltip formatter={(v: number) => [`${v}/10`, "Score"]} />
                <Bar dataKey="score" barSize={14} radius={[0, 4, 4, 0]}>
                  {topCountries.map((row) => (
                    <Cell key={row.country} fill={scoreHeatColor(row.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </VisualTile>
        </div>

        <div className="col-span-12 lg:col-span-3">
          <VisualTile title="Maturity mix" accent="gold">
            <ResponsiveContainer width="100%" height={CHART_H}>
              <BarChart data={maturityData} margin={{ bottom: 4, left: 0, right: 8 }}>
                <XAxis dataKey="name" tick={{ fontSize: 8, fill: "#5c6578" }} interval={0} angle={-25} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#5c6578" }} width={28} />
                <Tooltip />
                <Bar dataKey="value" name="Countries" barSize={28} radius={[4, 4, 0, 0]}>
                  {maturityData.map((d) => (
                    <Cell key={d.name} fill={MATURITY_COLORS[d.name] ?? PBI_FILLS.teal} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </VisualTile>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <VisualTile title="Average score by theme" accent="purple">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={themeAvg} margin={{ bottom: 48, left: 0, right: 8 }}>
                <XAxis dataKey="theme" tick={{ fontSize: 8, fill: "#5c6578" }} interval={0} angle={-35} textAnchor="end" height={56} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: "#5c6578" }} width={28} />
                <Tooltip labelFormatter={(_, payload) => payload?.[0]?.payload?.full ?? ""} />
                <Bar dataKey="avg" name="Avg score" fill={PBI_FILLS.purple} barSize={22} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </VisualTile>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <VisualTile title="Device approvals by region" accent="blue">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={regionDevices}
                  dataKey="devices"
                  nameKey="region"
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={72}
                  paddingAngle={2}
                  label={({ name, percent }) =>
                    `${String(name).split(" ")[0]} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {regionDevices.map((_, i) => (
                    <Cell key={i} fill={PBI_COLORS[i % PBI_COLORS.length]} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number, _n, p) => [v.toLocaleString(), p?.payload?.region]} />
              </PieChart>
            </ResponsiveContainer>
          </VisualTile>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <VisualTile title="Score matrix" subtitle="First 4 selected themes" accent="teal">
            <div className="max-h-[200px] overflow-auto rounded">
              <table className="w-full text-[10px]">
                <thead className="sticky top-0 bg-[#fafbfd]">
                  <tr>
                    <th className="border border-[#dde3ec] px-2 py-1.5 text-left">Country</th>
                    {selectedThemes.slice(0, 4).map((k) => (
                      <th key={k} className="border border-[#dde3ec] px-1 py-1.5">
                        {THEME_LABELS[k].split(" ")[0]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...filtered]
                    .sort((a, b) => a.country.localeCompare(b.country))
                    .map((r) => (
                      <tr key={r.country}>
                        <td className="border border-[#dde3ec] px-2 py-1 font-semibold">{r.country}</td>
                        {selectedThemes.slice(0, 4).map((k) => (
                          <td
                            key={k}
                            className="border border-[#dde3ec] px-1 py-1 text-center font-bold text-white"
                            style={{
                              backgroundColor: scoreHeatColor(r.scores[k]),
                              boxShadow: scoreHeatGlow(r.scores[k]),
                            }}
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
      </div>
    </div>
  );
}
