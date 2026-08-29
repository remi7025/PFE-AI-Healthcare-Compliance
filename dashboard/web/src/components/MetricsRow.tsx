import { useDashboard } from "../context/DashboardContext";
import { overallScore } from "../lib/data";

export function MetricsRow() {
  const { filtered, selectedThemes } = useDashboard();
  const avg =
    selectedThemes.length && filtered.length
      ? (
          filtered.reduce(
            (sum, r) => sum + overallScore(r, selectedThemes),
            0,
          ) / filtered.length
        ).toFixed(1)
      : "0.0";
  const devices = filtered.reduce((s, r) => s + r.aiDevicesApproved, 0);

  const items = [
    { label: "Countries Covered", value: String(filtered.length) },
    { label: "Regions", value: String(new Set(filtered.map((r) => r.region)).size) },
    { label: "Total AI Devices Approved", value: devices.toLocaleString() },
    { label: "Avg Compliance Score", value: `${avg}/10` },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="metric-card">
          <h3 className="text-3xl font-bold">{item.value}</h3>
          <p className="mt-1 text-sm opacity-90">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
