import { useEffect, useMemo, useState } from "react";
import {
  BookMarked,
  Cpu,
  Database,
  ExternalLink,
  Layers,
  MessageSquarePlus,
  Search,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Workflow,
} from "lucide-react";
import { useDashboard } from "../../../context/DashboardContext";
import { buildCorpus, runRagQuery, type RagCitation, type RagResult } from "../../../lib/rag";
import { linksForJurisdiction, PROMPT_CHIPS } from "../../../lib/statutes";
import { KpiTile, VisualTile } from "../VisualTile";
import { THEME_KEYS, THEME_LABELS } from "../../../constants";

const API_BASE = import.meta.env.VITE_RAG_API ?? "";

interface FeedbackItem {
  id: string;
  question: string;
  citationId?: string;
  vote?: "up" | "down";
  proposedScore?: number;
  theme?: string;
  country?: string;
  note: string;
  at: string;
}

function loadQueue(): FeedbackItem[] {
  try {
    return JSON.parse(localStorage.getItem("rag_review_queue") || "[]");
  } catch {
    return [];
  }
}

function saveQueue(items: FeedbackItem[]) {
  localStorage.setItem("rag_review_queue", JSON.stringify(items));
}

export function RagPage() {
  const {
    countries,
    literature,
    setActivePage,
    setSelectedCountry,
    ragQuery,
    setRagQuery,
  } = useDashboard();
  const [question, setQuestion] = useState(ragQuery || PROMPT_CHIPS[0].prompt);
  const [theme, setTheme] = useState("all");
  const [jurisdiction, setJurisdiction] = useState("all");
  const [result, setResult] = useState<RagResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [queue, setQueue] = useState<FeedbackItem[]>(() => loadQueue());
  const [modalOpen, setModalOpen] = useState(false);
  const [revision, setRevision] = useState({
    country: "",
    theme: "data_privacy",
    score: 5,
    note: "",
  });

  const corpus = useMemo(
    () => buildCorpus(countries, literature),
    [countries, literature],
  );

  const jurisdictions = useMemo(
    () => ["all", ...countries.map((c) => c.country).sort()],
    [countries],
  );

  useEffect(() => {
    if (ragQuery && ragQuery !== question) setQuestion(ragQuery);
  }, [ragQuery]);

  async function onAsk() {
    setBusy(true);
    setRagQuery(question);
    try {
      if (API_BASE) {
        const res = await fetch(`${API_BASE}/api/rag/query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question,
            k: 6,
            theme: theme === "all" ? null : theme,
            jurisdiction: jurisdiction === "all" ? null : jurisdiction,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as RagResult;
          setResult(data);
          setBusy(false);
          return;
        }
      }
    } catch {
      /* fall through to offline */
    }
    const r = runRagQuery(question, corpus, {
      k: 6,
      theme: theme === "all" ? undefined : theme,
      jurisdiction: jurisdiction === "all" ? undefined : jurisdiction,
    });
    setResult(r);
    setBusy(false);
  }

  function pushFeedback(item: FeedbackItem) {
    const next = [item, ...queue].slice(0, 50);
    setQueue(next);
    saveQueue(next);
  }

  function vote(v: "up" | "down", citationId?: string) {
    pushFeedback({
      id: `fb-${Date.now()}`,
      question,
      citationId,
      vote: v,
      note: v === "up" ? "Grounding OK" : "Flagged incorrect grounding",
      at: new Date().toISOString(),
    });
  }

  function submitRevision() {
    pushFeedback({
      id: `rev-${Date.now()}`,
      question,
      vote: "down",
      country: revision.country,
      theme: revision.theme,
      proposedScore: revision.score,
      note: revision.note || "Proposed score revision",
      at: new Date().toISOString(),
    });
    setModalOpen(false);
  }

  return (
    <div className="space-y-4 p-4">
      <div className="rounded border border-[#d8dee9] bg-gradient-to-r from-[#1a2332] to-[#243044] px-4 py-3 text-white">
        <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">
          Methodological pipeline
        </p>
        <p className="mt-1 text-sm">
          Input data → Processing → Hybrid RRF retrieval → Interactive dashboard
        </p>
        <p className="mt-1 text-[11px] text-white/60">
          Offline lexical + optional FAISS/RRF API · {corpus.length} chunks · not legal advice ·
          HITL review queue
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
          subtitle="Grounded retrieval with citation anchors"
          accent="purple"
          className="lg:col-span-3"
        >
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {PROMPT_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => {
                    setQuestion(chip.prompt);
                    setRagQuery(chip.prompt);
                  }}
                  className="rounded-full border border-[#c7d2fe] bg-[#eef2ff] px-2.5 py-1 text-[10px] font-medium text-[#3730a3] hover:border-[#6366f1] hover:bg-[#e0e7ff]"
                >
                  {chip.label}
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
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded bg-[#1a2332] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#118dff] disabled:opacity-60"
              >
                <Search className="h-3.5 w-3.5" />
                {busy ? "Retrieving…" : "Retrieve & answer"}
              </button>
            </div>
            {result && (
              <div className="rounded border border-[#e2e8f0] bg-[#fbfcfe] p-3">
                {result.abstained ? (
                  <div className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    Insufficient evidence in the indexed corpus. Refine the jurisdiction or theme,
                    or broaden the query.
                  </div>
                ) : (
                  <>
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#1a2332]">
                      <Sparkles className="h-3.5 w-3.5 text-[#7c3aed]" />
                      Grounded answer · {result.mode} · {result.latencyMs} ms
                      <span className="ml-auto flex gap-1">
                        <button
                          type="button"
                          title="Grounding OK"
                          onClick={() => vote("up")}
                          className="rounded border border-[#d0d7e2] p-1 hover:bg-emerald-50"
                        >
                          <ThumbsUp className="h-3.5 w-3.5 text-emerald-600" />
                        </button>
                        <button
                          type="button"
                          title="Flag grounding"
                          onClick={() => vote("down")}
                          className="rounded border border-[#d0d7e2] p-1 hover:bg-red-50"
                        >
                          <ThumbsDown className="h-3.5 w-3.5 text-red-500" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRevision((r) => ({
                              ...r,
                              country: jurisdiction !== "all" ? jurisdiction : countries[0]?.country ?? "",
                            }));
                            setModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded border border-[#d0d7e2] px-2 py-1 text-[10px] hover:bg-[#eef6ff]"
                        >
                          <MessageSquarePlus className="h-3 w-3" />
                          Suggest score revision
                        </button>
                      </span>
                    </div>
                    <div className="text-[12px] leading-relaxed text-[#3b4453]">
                      <CitedAnswer
                        answer={result.answer}
                        citations={result.citations}
                      />
                    </div>
                  </>
                )}
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
              { t: "2. Hybrid RRF", d: "BM25 + dense MiniLM · reciprocal rank fusion" },
              { t: "3. Distance gate", d: "Abstain below cosine / lexical confidence" },
              { t: "4. HITL queue", d: `${queue.length} review item(s) in local queue` },
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
          </div>
        </VisualTile>
      </div>

      {result && result.citations.length > 0 && !result.abstained && (
        <VisualTile title="Retrieved passages" subtitle="Ranked evidence + statute deep-links" accent="gold">
          <div className="grid gap-2 md:grid-cols-2">
            {result.citations.map((c) => (
              <SourceCard
                key={c.id}
                c={c}
                onOpen={() => {
                  if (c.jurisdiction !== "Multi") {
                    setSelectedCountry(c.jurisdiction);
                    setActivePage("details");
                  }
                }}
                onFlag={() => vote("down", c.id)}
              />
            ))}
          </div>
        </VisualTile>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-xl">
            <h3 className="text-sm font-bold text-[#1a2332]">Suggest score revision</h3>
            <p className="mt-1 text-[11px] text-[#5c6578]">
              Submits to the local curator review queue (HITL). Does not change live scores.
            </p>
            <div className="mt-3 space-y-2">
              <select
                value={revision.country}
                onChange={(e) => setRevision({ ...revision, country: e.target.value })}
                className="w-full rounded border px-2 py-1.5 text-xs"
              >
                {countries.map((c) => (
                  <option key={c.country} value={c.country}>
                    {c.country}
                  </option>
                ))}
              </select>
              <select
                value={revision.theme}
                onChange={(e) => setRevision({ ...revision, theme: e.target.value })}
                className="w-full rounded border px-2 py-1.5 text-xs"
              >
                {THEME_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {THEME_LABELS[k]}
                  </option>
                ))}
              </select>
              <label className="block text-[11px] text-[#5c6578]">
                Proposed score (1–10)
                <input
                  type="number"
                  min={1}
                  max={10}
                  step={0.5}
                  value={revision.score}
                  onChange={(e) =>
                    setRevision({ ...revision, score: Number(e.target.value) })
                  }
                  className="mt-1 w-full rounded border px-2 py-1.5 text-xs"
                />
              </label>
              <textarea
                value={revision.note}
                onChange={(e) => setRevision({ ...revision, note: e.target.value })}
                rows={3}
                placeholder="Rationale / incorrect passage reference…"
                className="w-full rounded border px-2 py-1.5 text-xs"
              />
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded border px-3 py-1.5 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitRevision}
                className="rounded bg-[#1a2332] px-3 py-1.5 text-xs font-semibold text-white"
              >
                Submit to queue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CitedAnswer({
  answer,
  citations,
}: {
  answer: string;
  citations: RagCitation[];
}) {
  const byId = Object.fromEntries(citations.map((c) => [c.id, c]));
  const parts = answer.split(/(\[[^\]]+\])/g);
  return (
    <p className="whitespace-pre-wrap font-sans">
      {parts.map((part, i) => {
        const m = part.match(/^\[([^\]]+)\]$/);
        if (m && byId[m[1]]) {
          return <CitationPopover key={i} citation={byId[m[1]]} label={part} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

function CitationPopover({
  citation,
  label,
}: {
  citation: RagCitation;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block">
      <button
        type="button"
        className="mx-0.5 rounded bg-[#eef2ff] px-1 font-mono text-[10px] font-bold text-[#4338ca] hover:bg-[#c7d2fe]"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
      >
        {label}
      </button>
      {open && (
        <span className="absolute bottom-full left-0 z-20 mb-1 w-64 rounded border border-[#c7d2fe] bg-white p-2 text-left text-[10px] shadow-lg">
          <span className="block font-semibold text-[#1a2332]">{citation.source}</span>
          <span className="mt-0.5 block text-[#6366f1]">
            {citation.jurisdiction} · {citation.theme}
          </span>
          <span className="mt-1 block leading-snug text-[#475569]">
            {citation.snippet.slice(0, 220)}
            {citation.snippet.length > 220 ? "…" : ""}
          </span>
        </span>
      )}
    </span>
  );
}

function SourceCard({
  c,
  onOpen,
  onFlag,
}: {
  c: RagCitation;
  onOpen: () => void;
  onFlag: () => void;
}) {
  const links = linksForJurisdiction(c.jurisdiction);
  return (
    <div className="rounded border border-[#e8ecf3] bg-white p-3 text-[11px]">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <span className="rounded bg-[#1a2332] px-1.5 py-0.5 font-mono text-[9px] text-white">
          [{c.id}]
        </span>
        <span className="rounded bg-[#eef6ff] px-1.5 py-0.5 text-[9px] text-[#118dff]">
          score {c.score}
        </span>
        <span className="text-[9px] text-[#5c6578]">{c.theme}</span>
      </div>
      <div className="font-semibold text-[#1a2332]">{c.source}</div>
      <p className="mt-1 line-clamp-4 text-[#3b4453]">{c.snippet}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {links.slice(0, 2).map((l) => (
          <a
            key={l.url}
            href={l.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-0.5 rounded border border-[#bfdbfe] bg-[#eff6ff] px-1.5 py-0.5 text-[9px] font-medium text-[#1d4ed8] hover:underline"
          >
            <ExternalLink className="h-2.5 w-2.5" />
            {l.title.length > 28 ? `${l.title.slice(0, 28)}…` : l.title}
          </a>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        {c.jurisdiction !== "Multi" && (
          <button
            type="button"
            className="text-[10px] font-semibold text-[#118dff] hover:underline"
            onClick={onOpen}
          >
            Open country detail →
          </button>
        )}
        <button
          type="button"
          className="text-[10px] text-red-500 hover:underline"
          onClick={onFlag}
        >
          Flag passage
        </button>
      </div>
    </div>
  );
}
