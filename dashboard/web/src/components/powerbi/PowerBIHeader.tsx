import clsx from "clsx";
import {
  BarChart3,
  BookOpen,
  GitCompare,
  Globe2,
  LayoutDashboard,
  Bot,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useDashboard } from "../../context/DashboardContext";

const PAGES = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "analysis", label: "Theme Analysis", icon: BarChart3 },
  { id: "comparison", label: "Comparison", icon: GitCompare },
  { id: "trends", label: "Trends & Use Cases", icon: TrendingUp },
  { id: "details", label: "Country Detail", icon: Globe2 },
  { id: "rag", label: "RAG Assistant", icon: Bot },
  { id: "literature", label: "Literature", icon: BookOpen },
] as const;

export type PowerBIPage = (typeof PAGES)[number]["id"];

export function PowerBIHeader() {
  const { activePage, setActivePage, filtered } = useDashboard();

  return (
    <header className="pbi-header relative shrink-0">
      <div className="relative flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-4">
          <div className="pbi-logo flex h-10 w-10 items-center justify-center rounded-lg">
            <Sparkles className="h-5 w-5 text-[#1a2332]" strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="bg-gradient-to-r from-white via-white to-blue-200 bg-clip-text text-base font-bold tracking-tight text-transparent">
                AI Healthcare Compliance Intelligence
              </h1>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Live
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-white/50">
              Dr. Anuradha Kar · {filtered.length} countries · 7 compliance themes · Mar 2026
            </p>
          </div>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <div className="rounded border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] text-white/60 backdrop-blur-sm">
            FDA · EU AI Act · WHO · OECD
          </div>
        </div>
      </div>
      <nav className="relative flex overflow-x-auto border-t border-white/10 px-3">
        {PAGES.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setActivePage(p.id)}
              className={clsx(
                "pbi-page-tab flex shrink-0 items-center gap-1.5",
                activePage === p.id && "pbi-page-tab-active",
              )}
            >
              <Icon className="h-3.5 w-3.5 opacity-80" />
              {p.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
