import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { FiAlertCircle, FiArrowRight, FiBriefcase, FiSearch, FiSliders } from "react-icons/fi";

import Page from "src/Shared/Page/Page";

import { searchTalentLens } from "./api";
import type {
  TalentLensCandidateResult,
  TalentLensEvidenceChunk,
  TalentLensInputMode,
  TalentLensSearchResponse,
} from "./types";

const suggestedSearches = [
  "React, TypeScript, machine learning",
  "Find students with Python, NLP, and research experience",
  "Data science intern with SQL, dashboards, and communication skills",
];

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
  style: "percent",
});

const formatScore = (score: number | null | undefined) => {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return "N/A";
  }

  return percentFormatter.format(score > 1 ? score / 100 : score);
};

const compactList = (items: string[] | null | undefined) =>
  Array.isArray(items) ? items.filter(Boolean) : [];

const getEvidenceText = (chunk: string | TalentLensEvidenceChunk) =>
  typeof chunk === "string" ? chunk : chunk.text || "";

const formatStatus = (status: string | Record<string, unknown> | null | undefined) => {
  if (!status) return "";
  if (typeof status === "string") return status;

  const entries = Object.entries(status)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => `${key}: ${String(value)}`);

  return entries.join(", ");
};

const FieldLabel = ({ children }: { children: ReactNode }) => (
  <span className="text-sm font-medium text-(--obs-text-muted)">{children}</span>
);

const Chip = ({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "cyan" | "orange" | "neutral";
}) => {
  const toneClass =
    tone === "cyan"
      ? "border-[#19B5CA]/35 bg-[#19B5CA]/10 text-[#8eeaf4]"
      : tone === "orange"
        ? "border-[#F58134]/35 bg-[#F58134]/10 text-[#ffbd89]"
        : "border-(--obs-border-mid) bg-(--obs-surface) text-(--obs-text-primary)";

  return (
    <span className={`rounded-md border px-2.5 py-1 text-xs font-medium ${toneClass}`}>
      {children}
    </span>
  );
};

const ScoreTile = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-(--obs-border) bg-(--obs-surface) px-3 py-2">
    <div className="text-xs text-(--obs-text-muted)">{label}</div>
    <div className="mt-1 text-lg font-semibold text-(--obs-text-primary)">{value}</div>
  </div>
);

const EmptyState = ({ onPickSearch }: { onPickSearch: (search: string) => void }) => (
  <section className="rounded-lg border border-dashed border-(--obs-border-mid) bg-(--obs-surface) p-6">
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="text-lg font-semibold text-(--obs-text-primary)">
          Start with a hiring signal
        </p>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-(--obs-text-muted)">
          Search by targeted skills, project experience, or paste a job description to rank DS3
          members by fit.
        </p>
      </div>
      <FiSearch className="hidden text-3xl text-[#19B5CA] md:block" aria-hidden />
    </div>
    <div className="mt-5 flex flex-wrap gap-2">
      {suggestedSearches.map(search => (
        <button
          key={search}
          type="button"
          className="rounded-md border border-(--obs-border) bg-transparent px-3 py-2 text-left text-sm text-(--obs-text-primary) transition hover:border-[#19B5CA]/45 hover:bg-[#19B5CA]/10"
          onClick={() => onPickSearch(search)}
        >
          {search}
        </button>
      ))}
    </div>
  </section>
);

const LoadingState = () => (
  <section className="rounded-lg border border-(--obs-border) bg-(--obs-surface) p-6">
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#19B5CA]/25 border-t-[#19B5CA]" />
      <div>
        <p className="font-semibold text-(--obs-text-primary)">Searching DS3 resume database...</p>
        <p className="mt-1 text-sm text-(--obs-text-muted)">
          Ranking candidates and pulling evidence from matching resume chunks.
        </p>
      </div>
    </div>
  </section>
);

const ErrorState = ({ message }: { message: string }) => (
  <section className="rounded-lg border border-[#ff6b6b]/35 bg-[#ff6b6b]/10 p-5">
    <div className="flex gap-3">
      <FiAlertCircle className="mt-1 shrink-0 text-xl text-[#ff8f8f]" aria-hidden />
      <div>
        <p className="font-semibold text-(--obs-text-primary)">
          TalentLens search could not complete
        </p>
        <p className="mt-2 text-sm leading-6 text-(--obs-text-muted)">{message}</p>
        <p className="mt-2 text-sm leading-6 text-(--obs-text-muted)">
          Confirm the API is running and that the Vite environment variable points to the active
          FastAPI service.
        </p>
      </div>
    </div>
  </section>
);

const CandidateCard = ({ candidate }: { candidate: TalentLensCandidateResult }) => {
  const matchedSkills = compactList(candidate.matched_skills);
  const evidenceChunks = (candidate.top_evidence_chunks || [])
    .map(chunk => getEvidenceText(chunk))
    .filter(Boolean)
    .slice(0, 3);
  const matchedRequirements = compactList(candidate.grok_matched_requirements);
  const missingRequirements = compactList(candidate.grok_missing_requirements);
  const weaknessFlags = compactList(candidate.grok_weakness_flags);
  const displayName = candidate.full_name || candidate.filename || `Candidate ${candidate.rank}`;
  const hardFilterStatus = formatStatus(candidate.hard_filter_status);

  return (
    <article className="rounded-lg border border-(--obs-border) bg-[rgba(255,255,255,0.045)] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone="orange">Rank {candidate.rank}</Chip>
            {candidate.company_match_status ? <Chip>{candidate.company_match_status}</Chip> : null}
            {candidate.grok_status ? <Chip tone="cyan">{candidate.grok_status}</Chip> : null}
          </div>
          <h3 className="mt-3 text-2xl font-semibold leading-tight text-(--obs-text-primary)">
            {displayName}
          </h3>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-(--obs-text-muted)">
            {candidate.major ? <span>{candidate.major}</span> : null}
            {candidate.graduation_year ? <span>Class of {candidate.graduation_year}</span> : null}
            {candidate.page_count ? <span>{candidate.page_count} resume page(s)</span> : null}
          </div>
        </div>
        <div className="grid min-w-[220px] grid-cols-2 gap-2">
          <ScoreTile label="Overall" value={formatScore(candidate.score)} />
          <ScoreTile label="Semantic" value={formatScore(candidate.semantic_score)} />
        </div>
      </div>

      {matchedSkills.length ? (
        <div className="mt-5">
          <p className="text-sm font-semibold text-(--obs-text-primary)">Matched skills</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {matchedSkills.map(skill => (
              <Chip key={skill} tone="cyan">
                {skill}
              </Chip>
            ))}
          </div>
        </div>
      ) : null}

      {candidate.grok_summary ? (
        <div className="mt-5 rounded-lg border border-[#19B5CA]/20 bg-[#19B5CA]/10 p-4">
          <p className="text-sm font-semibold text-(--obs-text-primary)">AI fit summary</p>
          <p className="mt-2 text-sm leading-6 text-(--obs-text-muted)">{candidate.grok_summary}</p>
        </div>
      ) : null}

      {evidenceChunks.length ? (
        <div className="mt-5">
          <p className="text-sm font-semibold text-(--obs-text-primary)">
            Why this candidate matched
          </p>
          <div className="mt-3 space-y-3">
            {evidenceChunks.map((chunk, index) => (
              <blockquote
                key={`${candidate.candidate_id}-evidence-${index}`}
                className="rounded-lg border-l-2 border-[#F58134] bg-(--obs-surface) px-4 py-3 text-sm leading-6 text-(--obs-text-muted)"
              >
                {chunk}
              </blockquote>
            ))}
          </div>
        </div>
      ) : null}

      {matchedRequirements.length || missingRequirements.length || weaknessFlags.length ? (
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {matchedRequirements.length ? (
            <RequirementList title="Requirements met" items={matchedRequirements} tone="cyan" />
          ) : null}
          {missingRequirements.length ? (
            <RequirementList title="Missing" items={missingRequirements} tone="orange" />
          ) : null}
          {weaknessFlags.length ? (
            <RequirementList title="Watchouts" items={weaknessFlags} />
          ) : null}
        </div>
      ) : null}

      {hardFilterStatus ? (
        <p className="mt-5 text-xs text-(--obs-text-faint)">Filter status: {hardFilterStatus}</p>
      ) : null}
    </article>
  );
};

const RequirementList = ({
  title,
  items,
  tone = "neutral",
}: {
  title: string;
  items: string[];
  tone?: "cyan" | "orange" | "neutral";
}) => (
  <div className="rounded-lg border border-(--obs-border) bg-(--obs-surface) p-3">
    <p className="text-sm font-semibold text-(--obs-text-primary)">{title}</p>
    <div className="mt-2 flex flex-wrap gap-2">
      {items.slice(0, 6).map(item => (
        <Chip key={item} tone={tone}>
          {item}
        </Chip>
      ))}
    </div>
  </div>
);

const TalentLens = () => {
  const [query, setQuery] = useState("");
  const [inputMode, setInputMode] = useState<TalentLensInputMode>("Skills");
  const [topK, setTopK] = useState(5);
  const [minScore, setMinScore] = useState(0);
  const [recruiterCompany, setRecruiterCompany] = useState("");
  const [recruiterJobTitle, setRecruiterJobTitle] = useState("");
  const [response, setResponse] = useState<TalentLensSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const results = useMemo(() => response?.results ?? [], [response]);
  const engineStatus = response?.engine_status;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!query.trim()) {
      setError("Enter skills, experience, or a job description before searching.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const searchResponse = await searchTalentLens({
        query: query.trim(),
        top_k: topK,
        min_score: minScore,
        input_mode: inputMode,
        recruiter_company: recruiterCompany.trim() || null,
        recruiter_job_title: recruiterJobTitle.trim() || null,
      });
      setResponse(searchResponse);
    } catch (searchError) {
      setResponse(null);
      setError(searchError instanceof Error ? searchError.message : "Search failed unexpectedly.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Page>
      <main className="relative z-10 w-full">
        <section className="mx-auto flex w-full max-w-[1300px] flex-col gap-8 px-[clamp(1.25rem,4vw,3rem)] py-[clamp(3rem,7vw,6rem)]">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.55fr)] lg:items-end">
            <div>
              <div className="mb-4 flex items-center gap-3 text-sm font-semibold text-[#19B5CA]">
                <span className="h-0.5 w-8 rounded-sm bg-[#19B5CA]" />
                Recruiter talent search
              </div>
              <h1 className="font-heading text-[clamp(3rem,7vw,6rem)] leading-none text-(--obs-text-primary)">
                TalentLens
              </h1>
              <p className="mt-5 max-w-3xl text-xl leading-8 text-(--obs-text-primary)">
                Search DS3 member resumes by skills, experience, or job description.
              </p>
              <p className="mt-4 max-w-3xl text-base leading-7 text-(--obs-text-muted)">
                TalentLens helps companies discover relevant DS3 talent with ranked candidate
                matches, transparent evidence, and optional AI summaries.
              </p>
            </div>

            <div className="rounded-lg border border-(--obs-border) bg-(--obs-surface) p-5">
              <div className="flex items-center gap-3">
                <FiBriefcase className="text-2xl text-[#F58134]" aria-hidden />
                <div>
                  <p className="font-semibold text-(--obs-text-primary)">Built for hiring teams</p>
                  <p className="mt-1 text-sm leading-6 text-(--obs-text-muted)">
                    Move from broad resume search to candidate-specific evidence in one workflow.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form
            className="rounded-lg border border-(--obs-border) bg-[rgba(255,255,255,0.05)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              <label className="flex flex-col gap-2">
                <FieldLabel>Search query</FieldLabel>
                <textarea
                  className="min-h-40 resize-y rounded-lg border border-(--obs-border) bg-(--obs-surface) px-4 py-3 text-base leading-7 text-(--obs-text-primary) outline-none transition placeholder:text-(--obs-text-faint) focus:border-[#19B5CA]/55"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder={`React, TypeScript, machine learning\nFind students with Python, NLP, and research experience\nPaste a job description here...`}
                />
              </label>

              <div className="grid gap-4">
                <label className="flex flex-col gap-2">
                  <FieldLabel>Input mode</FieldLabel>
                  <select
                    className="obs-select w-full"
                    value={inputMode}
                    onChange={event => setInputMode(event.target.value as TalentLensInputMode)}
                  >
                    <option value="Skills">Skills</option>
                    <option value="Job Description">Job Description</option>
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-2">
                    <FieldLabel>Top K</FieldLabel>
                    <input
                      className="rounded-lg border border-(--obs-border) bg-(--obs-surface) px-3 py-2 text-(--obs-text-primary) outline-none focus:border-[#19B5CA]/55"
                      type="number"
                      min={1}
                      max={20}
                      value={topK}
                      onChange={event => setTopK(Number(event.target.value))}
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <FieldLabel>Min score</FieldLabel>
                    <input
                      className="rounded-lg border border-(--obs-border) bg-(--obs-surface) px-3 py-2 text-(--obs-text-primary) outline-none focus:border-[#19B5CA]/55"
                      type="number"
                      min={0}
                      max={1}
                      step={0.05}
                      value={minScore}
                      onChange={event => setMinScore(Number(event.target.value))}
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-2">
                  <FieldLabel>Recruiter company</FieldLabel>
                  <input
                    className="rounded-lg border border-(--obs-border) bg-(--obs-surface) px-3 py-2 text-(--obs-text-primary) outline-none placeholder:text-(--obs-text-faint) focus:border-[#19B5CA]/55"
                    value={recruiterCompany}
                    onChange={event => setRecruiterCompany(event.target.value)}
                    placeholder="Optional"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <FieldLabel>Recruiter job title</FieldLabel>
                  <input
                    className="rounded-lg border border-(--obs-border) bg-(--obs-surface) px-3 py-2 text-(--obs-text-primary) outline-none placeholder:text-(--obs-text-faint) focus:border-[#19B5CA]/55"
                    value={recruiterJobTitle}
                    onChange={event => setRecruiterJobTitle(event.target.value)}
                    placeholder="Optional"
                  />
                </label>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-(--obs-border) pt-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 text-sm text-(--obs-text-muted)">
                <FiSliders aria-hidden />
                <span>Scores and evidence are returned by the TalentLens API.</span>
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F58134] px-5 py-3 font-semibold text-white transition hover:bg-[#f06f1d] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isLoading}
              >
                {isLoading ? "Searching..." : "Search TalentLens"}
                <FiArrowRight aria-hidden />
              </button>
            </div>
          </form>

          <section className="grid gap-4 md:grid-cols-3">
            {[
              "Enter skills or paste a job description",
              "TalentLens ranks resume matches",
              "Review evidence before outreach",
            ].map(tip => (
              <div
                key={tip}
                className="rounded-lg border border-(--obs-border) bg-(--obs-surface) p-4"
              >
                <p className="text-sm font-semibold text-(--obs-text-primary)">{tip}</p>
              </div>
            ))}
          </section>

          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-(--obs-text-primary)">
                  Candidate matches
                </h2>
                <p className="mt-1 text-sm text-(--obs-text-muted)">
                  {results.length
                    ? `${results.length} ranked candidate${results.length === 1 ? "" : "s"} returned`
                    : "Results will appear here after a search."}
                </p>
              </div>
              {engineStatus ? (
                <div className="flex flex-wrap gap-2">
                  <Chip>{engineStatus.mode_label}</Chip>
                  <Chip>{engineStatus.retrieval_backend}</Chip>
                  {engineStatus.demo_mode ? <Chip tone="orange">Demo mode</Chip> : null}
                </div>
              ) : null}
            </div>

            {isLoading ? <LoadingState /> : null}
            {error && !isLoading ? <ErrorState message={error} /> : null}
            {!isLoading && !error && !response ? <EmptyState onPickSearch={setQuery} /> : null}
            {!isLoading && !error && response && !results.length ? (
              <section className="rounded-lg border border-(--obs-border) bg-(--obs-surface) p-6">
                <p className="font-semibold text-(--obs-text-primary)">No matches found</p>
                <p className="mt-2 text-sm leading-6 text-(--obs-text-muted)">
                  Try broadening the skills, reducing the minimum score, or switching input mode.
                </p>
              </section>
            ) : null}

            {!isLoading && !error && results.length ? (
              <div className="grid gap-5">
                {results.map(candidate => (
                  <CandidateCard
                    key={candidate.candidate_id || candidate.filename}
                    candidate={candidate}
                  />
                ))}
              </div>
            ) : null}
          </section>
        </section>
      </main>
    </Page>
  );
};

export default TalentLens;
