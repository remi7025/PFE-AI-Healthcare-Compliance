import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function VisualTile({
  title,
  children,
  className = "",
  subtitle,
  headerExtra,
  accent = "blue",
}: {
  title: string;
  children: ReactNode;
  className?: string;
  subtitle?: string;
  headerExtra?: ReactNode;
  accent?: "blue" | "purple" | "teal" | "gold";
}) {
  const accentBar: Record<string, string> = {
    blue: "linear-gradient(90deg, #118dff, #06b6d4)",
    purple: "linear-gradient(90deg, #7c3aed, #118dff)",
    teal: "linear-gradient(90deg, #06b6d4, #059669)",
    gold: "linear-gradient(90deg, #f2c811, #e66c37)",
  };

  return (
    <div className={`pbi-visual ${className}`}>
      <div
        className="absolute left-0 right-0 top-0 h-[3px] opacity-80"
        style={{ background: accentBar[accent] }}
      />
      <div className="pbi-visual-title flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: accentBar[accent] }}
          />
          {title}
          {subtitle && (
            <span className="font-normal text-[10px] text-[#5c6578]">· {subtitle}</span>
          )}
        </span>
        {headerExtra}
      </div>
      <div className="pbi-visual-body">{children}</div>
    </div>
  );
}

export function KpiTile({
  label,
  value,
  icon: Icon,
  gradient = "linear-gradient(135deg, #118dff, #7c3aed)",
  glow = "rgba(17,141,255,0.12)",
  delay = 0,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  gradient?: string;
  glow?: string;
  delay?: number;
}) {
  return (
    <div
      className="pbi-kpi flex h-full items-center gap-3 px-4 py-3"
      style={
        {
          "--kpi-gradient": gradient,
          animationDelay: `${delay}ms`,
        } as React.CSSProperties
      }
    >
      <div
        className="pbi-kpi-icon shrink-0 text-white"
        style={{ background: gradient, boxShadow: `0 4px 14px ${glow}` }}
      >
        <Icon className="h-4 w-4" strokeWidth={2.5} />
      </div>
      <div>
        <div className="pbi-kpi-value">{value}</div>
        <div className="pbi-kpi-label">{label}</div>
      </div>
    </div>
  );
}
