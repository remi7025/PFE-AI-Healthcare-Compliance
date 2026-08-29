from pathlib import Path

ROOT = Path(__file__).resolve().parent


def demote(path: Path) -> None:
    t = path.read_text(encoding="utf-8")
    t = t.replace("\\subsubsection{", "\\paragraph{TEMPSUBSUB{")
    t = t.replace("\\subsection{", "\\subsubsection{")
    t = t.replace("\\section{", "\\subsection{")
    t = t.replace("\\chapter{", "\\section{")
    t = t.replace("\\paragraph{TEMPSUBSUB{", "\\subsubsection{")
    t = t.replace("Chapter~\\ref{ch:rag}", "Section~\\ref{sec:rag}")
    t = t.replace("Chapter~\\ref{ch:ai}", "Section~\\ref{sec:ai}")
    t = t.replace("\\label{ch:rag}", "\\label{sec:rag}")
    t = t.replace("\\label{ch:ai}", "\\label{sec:ai}")
    # remove clearpage at end of former chapters (optional polish)
    path.write_text(t, encoding="utf-8")
    print("demoted", path.name)


def main() -> None:
    demote(ROOT / "chapters" / "04b_ai_techniques.tex")
    demote(ROOT / "chapters" / "05_rag_implementation.tex")

    # Split former A_appendix into appendix body snippets
    (ROOT / "chapters" / "app_code_body.tex").write_text(
        r"""
\begin{lstlisting}[caption={Illustrative JSON country record fields},label=lst:json]
{
  "country": "European Union",
  "region": "Europe",
  "maturity_level": "Advanced",
  "themes_scores": {
    "data_privacy": 10,
    "clinical_validation": 9,
    "approval_process": 9,
    "transparency": 9,
    "ethics": 10,
    "post_market": 9,
    "liability": 8
  }
}
\end{lstlisting}

\begin{lstlisting}[caption={Composite score computation (conceptual)},label=lst:score]
def composite_score(themes_scores: dict) -> float:
    vals = list(themes_scores.values())
    return sum(vals) / len(vals)
\end{lstlisting}

Full application code is maintained at
\url{https://github.com/remi7025/AI-Healthcare-Compliance-Dashboard}
(\texttt{app.py}, \texttt{data/compliance\_dataset.json}, \texttt{literature\_review.md},
\texttt{web/} React dashboard, and \texttt{requirements.txt}).
""",
        encoding="utf-8",
    )

    (ROOT / "chapters" / "app_env_body.tex").write_text(
        r"""
Theme definitions, source lists, and trend objects are stored alongside country records in
\texttt{compliance\_dataset.json}. Regenerated \LaTeX\ tables and figures used in
Chapter~\ref{ch:results} live under \texttt{generated/} and \texttt{figures/}.
Extended country narratives appear in Appendix~\ref{app:profiles}.

\paragraph{Technical environment.}
Recommended environment: Python~3.9+, Node.js~18+ for the React app, MiKTeX or TeX~Live
for report compilation. Core Python libraries include \texttt{streamlit}, \texttt{plotly},
\texttt{pandas}, and \texttt{matplotlib}. Hardware requirements are modest (CPU laptop
sufficient for the dashboard MVP; GPU optional for future NLP fine-tuning). Install with
\texttt{pip install -r requirements.txt}, then \texttt{streamlit run app.py}. For the React
presentation layer: \texttt{cd web \&\& npm install \&\& npm run dev}.

\paragraph{Dissemination and host authorisation.}
This Final Year Project is an academic research deliverable hosted at aivancity (no separate
industry internship employer). The report uses only publicly available regulatory and
scientific sources; it contains no proprietary employer data and no identifiable patient data.
Accordingly, no separate company confidentiality redaction package is required for jury
dissemination of this non-confidential version. Public release of the open-source dashboard is
authorised by the student via the GitHub repository cited above.
""",
        encoding="utf-8",
    )

    (ROOT / "chapters" / "app_genai_body.tex").write_text(
        r"""
In accordance with aivancity PFE Writing Guidelines on generative AI (mandatory declaration):

\begin{itemize}
  \item \textbf{Tools used:} generative AI assistants (including Cursor-based coding agents)
        were used to help structure \LaTeX\ sources, expand draft wording from existing project
        materials, accelerate formatting, and assist with boilerplate code.
  \item \textbf{Tasks:} drafting assistance, code scaffolding, figure/script debugging, and
        consistency checks against the aivancity template structure.
  \item \textbf{Intellectual content:} all analyses, methodological choices, score
        interpretations, RAG design decisions, and conclusions were reviewed and validated by
        the student against primary regulatory sources and the curated dataset.
  \item \textbf{Verification:} AI-assisted text and code were inspected, tested locally where
        applicable, and remain the student's responsibility to understand and maintain.
  \item \textbf{Limits:} no AI system was used as a substitute for expert regulatory judgment;
        human-in-the-loop verification is part of the project design itself.
\end{itemize}
""",
        encoding="utf-8",
    )
    print("wrote appendix bodies")


if __name__ == "__main__":
    main()
