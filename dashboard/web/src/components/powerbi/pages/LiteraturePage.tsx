import { useMemo, useState, useCallback, useRef, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BookOpen,
  Building2,
  Dna,
  FileText,
  GraduationCap,
  List,
  Microscope,
  Pill,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { useDashboard } from "../../../context/DashboardContext";
import { LITERATURE_CARDS } from "../../../constants";
import { countKeywordMentions } from "../../../lib/scoring";
import { horizontalBarData } from "../chartHelpers";
import { PBI_COLORS } from "../chartTheme";
import { VisualTile } from "../VisualTile";
import type { KeyReference } from "../../../types";

const TAKEAWAY_ICONS = [Microscope, Dna, Pill, Building2, Users, Sparkles] as const;

const REF_TYPE_STYLES: Record<string, string> = {
  Guideline: "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Regulatory Document": "bg-blue-100 text-blue-800 border-blue-200",
  Research: "bg-violet-100 text-violet-800 border-violet-200",
  Policy: "bg-amber-100 text-amber-800 border-amber-200",
  Report: "bg-slate-100 text-slate-700 border-slate-200",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function extractText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object" && "props" in node) {
    return extractText((node as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

function parseLiteratureMeta(text: string) {
  const sections = (text.match(/^##\s+(.+)$/gm) ?? []).map((m) =>
    m.replace(/^##\s+/, "").trim(),
  );
  const abstractMatch = text.match(/## Abstract\s*\n+([\s\S]*?)(?=\n---|\n## )/);
  const abstract = abstractMatch?.[1]?.replace(/\*\*/g, "").trim() ?? "";
  const words = text.split(/\s+/).filter(Boolean).length;
  return { sections, abstract, words };
}

function readerContent(text: string): string {
  const start = text.indexOf("## Abstract");
  return start >= 0 ? text.slice(start) : text;
}

const MARKDOWN_COMPONENTS = {
  h1: ({ children }: { children?: ReactNode }) => (
    <h1 className="literature-h1">{children}</h1>
  ),
  h2: ({ children }: { children?: ReactNode }) => {
    const text = extractText(children);
    return (
      <h2 id={slugify(text)} className="literature-h2 scroll-mt-4">
        {children}
      </h2>
    );
  },
  h3: ({ children }: { children?: ReactNode }) => (
    <h3 className="literature-h3">{children}</h3>
  ),
  p: ({ children }: { children?: ReactNode }) => (
    <p className="literature-p">{children}</p>
  ),
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="literature-ul">{children}</ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="literature-ol">{children}</ol>
  ),
  li: ({ children }: { children?: ReactNode }) => (
    <li className="literature-li">{children}</li>
  ),
  strong: ({ children }: { children?: ReactNode }) => (
    <strong className="font-semibold text-[#1a2332]">{children}</strong>
  ),
  hr: () => <hr className="literature-hr" />,
  blockquote: ({ children }: { children?: ReactNode }) => (
    <blockquote className="literature-blockquote">{children}</blockquote>
  ),
  table: ({ children }: { children?: ReactNode }) => (
    <div className="literature-table-wrap overflow-x-auto">
      <table className="literature-table">{children}</table>
    </div>
  ),
  th: ({ children }: { children?: ReactNode }) => (
    <th className="literature-th">{children}</th>
  ),
  td: ({ children }: { children?: ReactNode }) => (
    <td className="literature-td">{children}</td>
  ),
};

function RefCard({ reference }: { reference: KeyReference }) {
  const badge = REF_TYPE_STYLES[reference.type] ?? "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <article className="literature-ref-card group">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12px] font-semibold leading-snug text-[#1a2332] group-hover:text-[#118dff]">
          {reference.title}
        </p>
        <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${badge}`}>
          {reference.type}
        </span>
      </div>
      <p className="mt-1.5 text-[11px] text-[#5c6578]">
        {reference.author}
        <span className="mx-1 text-[#c8ced8]">·</span>
        {reference.year}
      </p>
    </article>
  );
}

export function LiteraturePage() {
  const { literature, references } = useDashboard();
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const keywords = useMemo(() => countKeywordMentions(literature), [literature]);
  const chartData = useMemo(() => horizontalBarData(keywords, "mentions"), [keywords]);
  const meta = useMemo(() => parseLiteratureMeta(literature), [literature]);
  const body = useMemo(() => readerContent(literature), [literature]);

  const filteredRefs = references.filter(
    (r) =>
      !query ||
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.author.toLowerCase().includes(query.toLowerCase()) ||
      r.type.toLowerCase().includes(query.toLowerCase()),
  );

  const articleRef = useRef<HTMLElement>(null);

  const scrollToSection = useCallback((title: string) => {
    const id = slugify(title);
    const container = articleRef.current;
    const el = container?.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
    if (el && container) {
      container.scrollTo({ top: el.offsetTop - 12, behavior: "smooth" });
      setActiveSection(title);
    }
  }, []);

  const topTopic = keywords[0];

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-3">
      {/* Hero */}
      <header className="literature-hero shrink-0">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-white">
                <BookOpen className="h-4 w-4" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                AI Clinic · Research
              </span>
            </div>
            <h1 className="text-lg font-bold text-white sm:text-xl">
              Literature Review: AI Healthcare Compliance
            </h1>
            <p className="mt-1 text-[12px] text-white/75">
              Supervisor: Dr. Anuradha Kar · Systematic synthesis across 20 countries & 6 regions
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Words", value: meta.words.toLocaleString(), icon: FileText },
              { label: "Sections", value: String(meta.sections.length), icon: List },
              { label: "References", value: String(references.length), icon: GraduationCap },
              {
                label: "Top topic",
                value: topTopic ? topTopic.topic.split("/")[0].trim().slice(0, 14) : "—",
                icon: Microscope,
              },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="literature-stat-pill">
                <Icon className="h-3.5 w-3.5 text-white/80" />
                <div>
                  <p className="text-sm font-bold text-white">{value}</p>
                  <p className="text-[9px] uppercase tracking-wide text-white/60">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {meta.abstract && (
          <p className="mt-3 max-w-4xl border-t border-white/15 pt-3 text-[12px] leading-relaxed text-white/85">
            {meta.abstract.length > 320 ? `${meta.abstract.slice(0, 320)}…` : meta.abstract}
          </p>
        )}
      </header>

      {/* Insights row */}
      <div className="grid shrink-0 grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7">
          <VisualTile title="Topic frequency" subtitle="Mentions across the review" accent="blue">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 4, right: 20, top: 4, bottom: 4 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: "#5c6578" }} />
                <YAxis
                  type="category"
                  dataKey="topic"
                  width={148}
                  tick={{ fontSize: 10, fill: "#5c6578" }}
                />
                <Tooltip
                  formatter={(v: number) => [v, "Mentions"]}
                  contentStyle={{ fontSize: 11, borderRadius: 6 }}
                />
                <Bar dataKey="mentions" barSize={16} radius={[0, 5, 5, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={PBI_COLORS[i % PBI_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </VisualTile>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <VisualTile title="Domain insights" subtitle="Key takeaways by use case" accent="purple">
            <div className="grid max-h-[220px] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {LITERATURE_CARDS.map(([title, body], i) => {
                const Icon = TAKEAWAY_ICONS[i % TAKEAWAY_ICONS.length];
                return (
                  <div key={title} className="literature-takeaway-card">
                    <div
                      className="mb-1.5 flex h-7 w-7 items-center justify-center rounded-md text-white"
                      style={{ background: PBI_COLORS[i % PBI_COLORS.length] }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-[11px] font-bold text-[#1a2332]">{title}</p>
                    <p className="mt-0.5 text-[10px] leading-snug text-[#5c6578]">{body}</p>
                  </div>
                );
              })}
            </div>
          </VisualTile>
        </div>
      </div>

      {/* Reader + references */}
      <div className="grid min-h-0 flex-1 grid-cols-12 gap-3">
        <aside className="col-span-12 flex flex-col gap-3 lg:col-span-3">
          <VisualTile title="Contents" accent="teal" className="lg:sticky lg:top-0">
            <nav className="max-h-[200px] space-y-0.5 overflow-y-auto pr-1 lg:max-h-[280px]">
              {meta.sections.map((section) => (
                <button
                  key={section}
                  type="button"
                  onClick={() => scrollToSection(section)}
                  className={`literature-toc-item w-full text-left ${
                    activeSection === section ? "literature-toc-item-active" : ""
                  }`}
                >
                  {section}
                </button>
              ))}
            </nav>
          </VisualTile>

          <VisualTile title="References" subtitle={`${filteredRefs.length} sources`} accent="gold">
            <div className="relative mb-2">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8a929e]" />
              <input
                type="search"
                placeholder="Search title, author, type…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="literature-search w-full pl-8"
              />
            </div>
            <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
              {filteredRefs.length ? (
                filteredRefs.map((item) => <RefCard key={item.title} reference={item} />)
              ) : (
                <p className="py-4 text-center text-[11px] text-[#8a929e]">No references match your search.</p>
              )}
            </div>
          </VisualTile>
        </aside>

        <div className="col-span-12 lg:col-span-9">
          <VisualTile
            title="Full literature review"
            subtitle="March 2026 · Peer-reviewed & regulatory sources"
            accent="blue"
            className="min-h-[480px]"
          >
            <article ref={articleRef} className="literature-pro max-h-[calc(100vh-220px)] overflow-y-auto pr-3">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
                {body}
              </ReactMarkdown>
            </article>
          </VisualTile>
        </div>
      </div>
    </div>
  );
}
