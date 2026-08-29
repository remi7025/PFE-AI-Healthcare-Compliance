import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboard } from "../../context/DashboardContext";
import { LITERATURE_CARDS } from "../../constants";
import { countKeywordMentions } from "../../lib/scoring";

export function LiteratureTab() {
  const { literature, references } = useDashboard();
  const [query, setQuery] = useState("");

  const keywords = useMemo(() => countKeywordMentions(literature), [literature]);

  const sections = useMemo(() => {
    const matches = literature.match(/^##\s+(.+)$/gm) ?? [];
    return matches.map((m) => m.replace(/^##\s+/, ""));
  }, [literature]);

  const filteredRefs = references.filter(
    (r) =>
      !query ||
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.author.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-brand-900">Literature Review Summary</h3>
        <p className="mt-2 text-sm text-slate-600">
          Key findings from the systematic literature review on AI healthcare compliance and
          regulations, aligned with project objectives in the AI Clinic specification.
        </p>
      </div>

      <section>
        <h4 className="mb-4 font-semibold">Key Takeaways</h4>
        <div className="grid gap-4 md:grid-cols-2">
          {LITERATURE_CARDS.map(([title, body]) => (
            <article key={title} className="card p-4">
              <h5 className="font-bold text-brand-900">{title}</h5>
              <p className="mt-2 text-sm text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h4 className="mb-3 font-semibold">Topic Frequency in Literature Review</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={keywords} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" />
              <YAxis type="category" dataKey="topic" width={200} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="mentions" fill="#6366f1" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {sections.length > 0 && (
        <section>
          <h4 className="mb-2 font-semibold">Main Sections</h4>
          <ul className="grid gap-2 sm:grid-cols-2">
            {sections.map((s) => (
              <li key={s} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {s}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h4 className="mb-3 font-semibold">Key References</h4>
        <input
          type="search"
          placeholder="Search references..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-4 w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <div className="grid gap-3 md:grid-cols-2">
          {filteredRefs.map((ref) => (
            <article key={ref.title} className="card p-4 text-sm">
              <p className="font-semibold text-slate-900">{ref.title}</p>
              <p className="mt-1 text-slate-600">
                {ref.author} · {ref.year} · {ref.type}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="card p-6">
        <h4 className="mb-4 font-semibold">Full Literature Review</h4>
        <div className="markdown-body max-h-[600px] overflow-y-auto pr-2">
          <ReactMarkdown>{literature}</ReactMarkdown>
        </div>
      </section>
    </div>
  );
}
