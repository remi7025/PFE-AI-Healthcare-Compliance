import { useId } from "react";
import { ATLAS_NAME_TO_ISO3 } from "../../constants";

/** Unique SVG gradient defs per chart instance (duplicate ids break fills). */
export function ChartGradients({ prefix }: { prefix: string }) {
  const p = prefix.replace(/:/g, "");
  return (
    <defs>
      <linearGradient id={`${p}-blue`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#118dff" />
        <stop offset="100%" stopColor="#06b6d4" />
      </linearGradient>
      <linearGradient id={`${p}-purple`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7c3aed" />
        <stop offset="100%" stopColor="#118dff" />
      </linearGradient>
      <linearGradient id={`${p}-teal`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <linearGradient id={`${p}-gold`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#f2c811" />
        <stop offset="100%" stopColor="#e66c37" />
      </linearGradient>
    </defs>
  );
}

export function useChartGradients() {
  const id = useId();
  return {
    prefix: id,
    blue: `url(#${id.replace(/:/g, "")}-blue)`,
    purple: `url(#${id.replace(/:/g, "")}-purple)`,
    teal: `url(#${id.replace(/:/g, "")}-teal)`,
    gold: `url(#${id.replace(/:/g, "")}-gold)`,
    Gradients: () => <ChartGradients prefix={id} />,
  };
}

/** Recharts vertical bars: put highest value at top of chart. */
export function horizontalBarData<T>(rows: T[], valueKey: keyof T): T[] {
  return [...rows].sort(
    (a, b) => Number(a[valueKey]) - Number(b[valueKey]),
  );
}

export const THEME_SHORT_LABELS: Record<string, string> = {
  "Data Privacy": "Privacy",
  "Clinical Validation": "Clinical",
  "Approval Process": "Approval",
  Transparency: "Transparency",
  Ethics: "Ethics",
  "Post-Market Surveillance": "Post-Mkt",
  Liability: "Liability",
};

export function geoIso3(properties: Record<string, unknown> | undefined): string {
  if (!properties) return "";
  const code =
    properties.ISO_A3 ??
    properties.iso_a3 ??
    properties.ADM0_A3 ??
    properties.ISO_A3_EH;
  if (typeof code === "string" && code.length === 3 && code !== "-99") return code;
  const name = properties.name;
  if (typeof name === "string") return ATLAS_NAME_TO_ISO3[name] ?? "";
  return "";
}
