import { useMemo, useState } from "react";
import {
  BookMarked,
  Cpu,
  Database,
  Layers,
  Search,
  Sparkles,
  Workflow,
} from "lucide-react";
import { useDashboard } from "../../../context/DashboardContext";
import { buildCorpus, runRagQuery, type RagResult } from "../../../lib/rag";
import { KpiTile, VisualTile } from "../VisualTile";
import { THEME_KEYS, THEME_LABELS } from "../../../constants";

const EXAMPLES = [
  "Compare EU and US transparency duties for SaMD",
  "What privacy laws apply to health AI in India?",
  "Why does liability lag privacy in emerging markets?",
  "Post-market surveillance expectations in Japan",
  "Does the EU AI Act raise documentation duties for high-risk healthcare AI?",
];

export function RagPage() {
  const { countries, literature, setActivePage, setSelectedCountry } = useDashboard();
  const [question, setQuestion] = useState(EXAMPLES[0]);
  const [theme, setTheme] = useState("all");
  const [jurisdiction, setJurisdiction] = useState("all");
  const [result, setResult] = useState<RagResult | null>(null);

  const corpus = useMemo(
    () => buildCorpus(countries, literature),
    [countries, literature],
  );

  const jurisdictions = useMemo(
    () => ["all", ...countries.map((c) => c.country).sort()],
    [countries],
  );

  function onAsk() {
    const r = runRagQuery(question, corpus, {
      k: 6,
      theme: theme === "all" ? undefined : theme,
      jurisdiction: jurisdiction === "all" ? undefined : jurisdiction,
    });
    setResult(r);
  }

  return (
    <div className="space-y-4 p-4">
      <div className="rounded border border-[#d8dee9] bg-gradient-to-r from-[#1a2332] to-[#243044] px-4 py-3 text-white">
        <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">
          Methodological pipeline
        </p>
        <p className="mt-1 text-sm">
          Input data → Processing → RAG retrieval → Interactive dashboard
        </p>
        <p className="mt-1 text-[11px] text-white/60">
          Offline hybrid-lexical RAG over {corpus.length} chunks · not legal advice · HITL for
          score edits
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiTile
          label="Corpus size"
          value={String(corpus.length)}
          icon={Database}
          gradient="linear-gradient(135deg, #118dff, #06b6d4)"
        />
        <KpiTile
          label="Themes"
          value="7"
          icon={Layers}
          gradient="linear-gradient(135deg, #7c3aed, #118dff)"
        />
        <KpiTile
          label="Jurisdictions"
          value={String(countries.length)}
          icon={BookMarked}
          gradient="linear-gradient(135deg, #059669, #06b6d4)"
        />
        <KpiTile
          label="Last latency"
          value={result ? `${result.latencyMs} ms` : "—"}
          icon={Cpu}
          gradient="linear-gradient(135deg, #f2c811, #e66c37)"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <VisualTile
          title="RAG Assistant"
          subtitle="Grounded retrieval over curated corpus"
          accent="purple"
          className="lg:col-span-3"
        >
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setQuestion(ex)}
                  className="rounded border border-[#d8dee9] bg-[#f7f9fc] px-2 py-1 text-[10px] text-[#3b4453] hover:border-[#118dff] hover:text-[#118dff]"
                >
                  {ex.length > 42 ? `${ex.slice(0, 42)}…` : ex}
                </button>
              ))}
            </div>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              className="w-full rounded border border-[#d0d7e2] bg-white px-3 py-2 text-sm text-[#1a2332] outline-none ring-[#118dff] focus:ring-2"
              placeholder="Ask a compliance research question…"
            />
            <div className="flex flex-wrap gap-2">
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="rounded border border-[#d0d7e2] bg-white px-2 py-1.5 text-xs"
              >
                <option value="all">All themes</option>
                {THEME_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {THEME_LABELS[k]}
                  </option>
                ))}
              </select>
              <select
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className="rounded border border-[#d0d7e2] bg-white px-2 py-1.5 text-xs"
              >
                {jurisdictions.map((j) => (
                  <option key={j} value={j}>
                    {j === "all" ? "All jurisdictions" : j}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={onAsk}
                className="inline-flex items-center gap-1.5 rounded bg-[#1a2332] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#118dff]"
              >
                <Search className="h-3.5 w-3.5" />
                Retrieve & answer
              </button>
            </div>
            {result && (
              <div className="rounded border border-[#e2e8f0] bg-[#fbfcfe] p-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#1a2332]">
                  <Sparkles className="h-3.5 w-3.5 text-[#7c3aed]" />
                  Grounded answer · {result.mode} · {result.latencyMs} ms
                </div>
                <pre className="whitespace-pre-wrap font-sans text-[12px] leading-relaxed text-[#3b4453]">
                  {result.answer}
                </pre>
              </div>
            )}
          </div>
        </VisualTile>

        <VisualTile
          title="Methodological pipeline"
          subtitle="Defence view"
          accent="teal"
          className="lg:col-span-2"
        >
          <div className="space-y-2">
            {[
              { t: "1. Corpus", d: "Laws, guidance, literature, country JSON chunks" },
              { t: "2. Retrieve", d: "Top-k passages (BM25 / hybrid ranking)" },
              { t: "3. Grounded answer", d: "Answer only from retrieved text + citations" },
              { t: "4. Dashboard", d: "Show answer, sources, and country deep-links" },
            ].map((s) => (
              <div
                key={s.t}
                className="rounded border border-[#e2e8f0] bg-white px-3 py-2"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-[#1a2332]">
                  <Workflow className="h-3.5 w-3.5 text-[#06b6d4]" />
                  {s.t}
                </div>
                <p className="mt-1 text-[11px] text-[#5c6578]">{s.d}</p>
              </div>
            ))}
            <p className="text-[10px] text-[#8b93a7]">
              Not legal advice. Theme score edits require human-in-the-loop confirmation.
            </p>
          </div>
        </VisualTile>
      </div>

      {result && result.citations.length > 0 && (
        <VisualTile title="Retrieved passages" subtitle="Ranked evidence" accent="gold">
          <div className="grid gap-2 md:grid-cols-2">
            {result.citations.map((c) => (
              <div
                key={c.id}
                className="rounded border border-[#e8ecf3] bg-white p-3 text-[11px]"
              >
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="rounded bg-[#1a2332] px-1.5 py-0.5 font-mono text-[9px] text-white">
                    {c.id}
                  </span>
                  <span className="rounded bg-[#eef6ff] px-1.5 py-0.5 text-[9px] text-[#118dff]">
                    score {c.score}
                  </span>
                  <span className="text-[9px] text-[#5c6578]">{c.theme}</span>
                </div>
                <div className="font-semibold text-[#1a2332]">{c.source}</div>
                <p className="mt-1 line-clamp-4 text-[#3b4453]">{c.snippet}</p>
                {c.jurisdiction !== "Multi" && (
                  <button
                    type="button"
                    className="mt-2 text-[10px] font-semibold text-[#118dff] hover:underline"
                    onClick={() => {
                      setSelectedCountry(c.jurisdiction);
                      setActivePage("details");
                    }}
                  >
                    Open country detail →
                  </button>
                )}
              </div>
            ))}
          </div>
        </VisualTile>
      )}
    </div>
  );
}
