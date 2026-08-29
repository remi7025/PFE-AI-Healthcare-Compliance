import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { useDashboard } from "../../context/DashboardContext";
import { ADOPTION_COLORS } from "../../constants";

export function TrendsTab() {
  const { filtered, trends } = useDashboard();

  const timeline = [...filtered].sort((a, b) => a.firstAiRegYear - b.firstAiRegYear);

  const regionDevices = Object.entries(
    filtered.reduce<Record<string, number>>((acc, r) => {
      acc[r.region] = (acc[r.region] ?? 0) + r.aiDevicesApproved;
      return acc;
    }, {}),
  ).map(([region, devices]) => ({ region, devices }));

  const pieColors = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-brand-900">
        Global Trends in AI Healthcare Regulation
      </h3>

      <section>
        <h4 className="mb-3 font-semibold">Timeline: First AI-Related Regulation</h4>
        <div className="h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ left: 10, right: 10 }}>
              <XAxis
                type="number"
                dataKey="firstAiRegYear"
                name="Year"
                domain={["dataMin - 1", "dataMax + 1"]}
              />
              <YAxis type="category" dataKey="country" width={120} />
              <ZAxis range={[80, 80]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={timeline} fill="#6366f1" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h4 className="mb-4 font-semibold">Key Regulatory Trends</h4>
        <div className="grid gap-4 md:grid-cols-2">
          {trends.map((t) => (
            <article key={t.trend} className="card p-4">
              <h5 className="font-semibold text-slate-900">{t.trend}</h5>
              <p className="mt-2 text-sm text-slate-600">{t.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                  style={{ backgroundColor: ADOPTION_COLORS[t.adoption_level] ?? "#6b7280" }}
                >
                  {t.adoption_level} Adoption
                </span>
                <span className="text-xs text-slate-400">Since {t.year_emerged}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h4 className="mb-3 font-semibold">AI Medical Device Approvals by Region</h4>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={regionDevices}
                dataKey="devices"
                nameKey="region"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={120}
                label={({ region, percent }) =>
                  `${region} ${(percent * 100).toFixed(0)}%`
                }
              >
                {regionDevices.map((_, i) => (
                  <Cell key={i} fill={pieColors[i % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
