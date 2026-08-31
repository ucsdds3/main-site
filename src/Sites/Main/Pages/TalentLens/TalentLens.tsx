import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useSearchParams } from "react-router";
import {
  FiAlertCircle,
  FiArrowRight,
  FiBookmark,
  FiBriefcase,
  FiClipboard,
  FiDownload,
  FiMessageSquare,
  FiSearch,
  FiSliders,
  FiX,
} from "react-icons/fi";

import Page from "src/Shared/Page/Page";

import { searchTalentLens } from "./api";
import CandidateCard from "./components/CandidateCard";
import CandidateDetailModal from "./components/CandidateDetailModal";
import FeedbackModal from "./components/FeedbackModal";
import SavedCandidatesPanel from "./components/SavedCandidatesPanel";
import type { FeedbackContext } from "./feedbackTypes";
import { useTalentLensAuth } from "./hooks/useTalentLensAuth";
import SearchSuggestions, {
  buildSuggestionItems,
  type SuggestionItem,
} from "./components/SearchSuggestions";
import GraduationYearFilterPanel from "./components/GraduationYearFilter";
import { Chip, FieldLabel } from "./components/ui";
import { GRADUATION_YEAR_SELECT_OPTIONS, skillSuggestions, suggestedSearches } from "./constants";
import { useRecentQueries } from "./hooks/useRecentQueries";
import { useResultKeyboardNav } from "./hooks/useResultKeyboardNav";
import { useSavedCandidates } from "./hooks/useSavedCandidates";
import { getCandidateStorageId } from "./storage";
import {
  EMPTY_GRADUATION_YEAR_FILTER,
  type GraduationYearFilter,
  type SearchTimingMeta,
  type TalentLensCandidateResult,
  type TalentLensInputMode,
  type TalentLensSearchRequest,
  type TalentLensSearchResponse,
} from "./types";
import {
  collectGraduationYearOptions,
  clampTopK,
  exportCandidatesCsv,
  exportCandidatesJson,
  filterCandidatesByGradYear,
  getCandidateContact,
  getSearchTopK,
  isGraduationYearFilterActive,
  msFormatter,
  prepareSearchResults,
} from "./utils";

const getSkillQueryParts = (value: string) =>
  value
    .split(",")
    .map(part => part.trim())
    .filter(Boolean);

const dedupeQueryParts = (parts: string[]) => {
  const seen = new Set<string>();
  return parts.filter(part => {
    const normalized = part.toLocaleLowerCase();
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
};

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
          Confirm TalentLens V2 is running and that VITE_TALENTLENS_V2_API_URL points to the active
          FastAPI service.
        </p>
      </div>
    </div>
  </section>
);

const TalentLens = () => {
  const { user, role: reporterRole } = useTalentLensAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [inputMode, setInputMode] = useState<TalentLensInputMode>("Skills");
  const [topK, setTopK] = useState(5);
  const [includeRelated, setIncludeRelated] = useState(true);
  const [gradYearFilter, setGradYearFilter] = useState<GraduationYearFilter>(
    EMPTY_GRADUATION_YEAR_FILTER
  );
  const [recruiterCompany, setRecruiterCompany] = useState("");
  const [recruiterJobTitle, setRecruiterJobTitle] = useState("");
  const [response, setResponse] = useState<TalentLensSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSearchMeta, setLastSearchMeta] = useState<SearchTimingMeta | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [detailCandidate, setDetailCandidate] = useState<TalentLensCandidateResult | null>(null);
  const [isSavedPanelOpen, setIsSavedPanelOpen] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [suggestionActiveIndex, setSuggestionActiveIndex] = useState(0);
  const [lastSearchRequest, setLastSearchRequest] = useState<TalentLensSearchRequest | null>(
    null
  );
  const [feedbackContext, setFeedbackContext] = useState<FeedbackContext | null>(null);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const jdTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const suggestionsListboxId = "talentlens-search-suggestions";

  const { recentQueries, addRecentQuery } = useRecentQueries();
  const { saved, isSaved, toggleSaved, unsave, clearAll, findSaved } = useSavedCandidates();

  const rawResults = useMemo(() => response?.results ?? [], [response]);
  const gradYearFilterActive = isGraduationYearFilterActive(gradYearFilter);
  const graduationYearOptions = useMemo(
    () =>
      rawResults.length
        ? collectGraduationYearOptions(rawResults)
        : [...GRADUATION_YEAR_SELECT_OPTIONS],
    [rawResults]
  );
  const results = useMemo(
    () => prepareSearchResults(rawResults, gradYearFilter, topK),
    [gradYearFilter, rawResults, topK]
  );
  const verifiedResults = useMemo(
    () => results.filter(candidate => candidate.match_tier !== "related"),
    [results]
  );
  const relatedResults = useMemo(
    () => results.filter(candidate => candidate.match_tier === "related"),
    [results]
  );
  const matchSummary = response?.match_summary ?? null;
  const parsedQuerySignals = useMemo(() => {
    const parsed = response?.parsed_query;
    if (!parsed) return [];
    return dedupeQueryParts([
      ...parsed.must_have_skills,
      ...parsed.semantic_requirements,
      ...parsed.graduation_years.map(year => `Class of ${year}`),
      ...(parsed.major_contains ? [`Major: ${parsed.major_contains}`] : []),
      ...parsed.exclusions.map(exclusion => `Excludes: ${exclusion}`),
    ]);
  }, [response?.parsed_query]);

  const selectedSkills = useMemo(() => {
    const queryParts = new Set(getSkillQueryParts(query).map(part => part.toLocaleLowerCase()));
    return skillSuggestions.filter(skill => queryParts.has(skill.toLocaleLowerCase()));
  }, [query]);

  const effectiveQuery = useMemo(() => {
    if (inputMode === "Job Description") return query.trim();
    return dedupeQueryParts(getSkillQueryParts(query)).join(", ");
  }, [inputMode, query]);

  const suggestionItems = useMemo(
    () => buildSuggestionItems(query, inputMode, recentQueries),
    [inputMode, query, recentQueries]
  );

  const openCandidate = useCallback((candidate: TalentLensCandidateResult) => {
    setDetailCandidate(candidate);
    const id = getCandidateStorageId(candidate);
    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev);
        next.set("candidate", id);
        return next;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  const closeDetail = useCallback(() => {
    setDetailCandidate(null);
    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev);
        next.delete("candidate");
        return next;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  const resolveCandidateById = useCallback(
    (candidateId: string) => {
      const fromResults = results.find(item => getCandidateStorageId(item) === candidateId);
      if (fromResults) return fromResults;
      return findSaved(candidateId) ?? null;
    },
    [findSaved, results]
  );

  useEffect(() => {
    const candidateId = searchParams.get("candidate");
    if (!candidateId) {
      setDetailCandidate(null);
      return;
    }
    const candidate = resolveCandidateById(candidateId);
    if (candidate) setDetailCandidate(candidate);
  }, [resolveCandidateById, searchParams]);

  useEffect(() => {
    if (!results.length) {
      setFocusedIndex(0);
      return;
    }
    setFocusedIndex(current => Math.min(current, results.length - 1));
  }, [results.length]);

  const { setCardRef } = useResultKeyboardNav({
    results,
    isEnabled: results.length > 0 && !isLoading && !detailCandidate,
    focusedIndex,
    setFocusedIndex,
    onOpen: openCandidate,
    suggestionsOpen: isSuggestionsOpen,
  });

  const applySuggestion = (item: SuggestionItem) => {
    if (item.type === "recent" && item.inputMode !== inputMode) {
      setInputMode(item.inputMode);
    }
    setQuery(item.query);
    setIsSuggestionsOpen(false);
    setSuggestionActiveIndex(0);
  };

  const handleSearchFieldKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!isSuggestionsOpen || !suggestionItems.length) {
      if (event.key === "Escape") setIsSuggestionsOpen(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSuggestionActiveIndex(prev => (prev + 1) % suggestionItems.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSuggestionActiveIndex(
        prev => (prev - 1 + suggestionItems.length) % suggestionItems.length
      );
      return;
    }

    if (event.key === "Enter" && suggestionActiveIndex >= 0) {
      event.preventDefault();
      applySuggestion(suggestionItems[suggestionActiveIndex]);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsSuggestionsOpen(false);
    }
  };

  const toggleSkill = (skill: string) => {
    const normalizedSkill = skill.toLocaleLowerCase();
    const parts = dedupeQueryParts(getSkillQueryParts(query));
    const isSelected = parts.some(part => part.toLocaleLowerCase() === normalizedSkill);
    const nextParts = isSelected
      ? parts.filter(part => part.toLocaleLowerCase() !== normalizedSkill)
      : [...parts, skill];
    setQuery(nextParts.join(", "));
    setSuggestionActiveIndex(0);
  };

  const clearSelectedSkills = () => {
    const knownSkills = new Set(skillSuggestions.map(skill => skill.toLocaleLowerCase()));
    setQuery(
      getSkillQueryParts(query)
        .filter(part => !knownSkills.has(part.toLocaleLowerCase()))
        .join(", ")
    );
  };

  const handleClear = () => {
    setQuery("");
    setRecruiterCompany("");
    setRecruiterJobTitle("");
    setGradYearFilter(EMPTY_GRADUATION_YEAR_FILTER);
    setResponse(null);
    setError(null);
    setActionMessage(null);
    setLastSearchMeta(null);
    setFocusedIndex(0);
    closeDetail();
  };

  const confirmExport = (format: "CSV" | "JSON") => {
    if (!results.length) return false;
    return window.confirm(
      `Export ${results.length} candidate${results.length === 1 ? "" : "s"} as ${format}?`
    );
  };

  const exportContacts = () => {
    if (!confirmExport("CSV")) return;
    exportCandidatesCsv(results);
    setActionMessage("Exported candidate contact CSV.");
  };

  const exportJson = () => {
    if (!confirmExport("JSON")) return;
    exportCandidatesJson(results);
    setActionMessage("Exported candidate contact JSON.");
  };

  const copyEmails = async () => {
    const emails = Array.from(
      new Set(results.map(candidate => getCandidateContact(candidate).email).filter(Boolean))
    );

    if (!emails.length) {
      setActionMessage("No emails were found in these results.");
      return;
    }

    try {
      await navigator.clipboard.writeText(emails.join(", "));
      setActionMessage(`Copied ${emails.length} email${emails.length === 1 ? "" : "s"}.`);
    } catch {
      setActionMessage(`Emails: ${emails.join(", ")}`);
    }
  };

  const runSearch = useCallback(
    async (options?: { includeRelatedOverride?: boolean }) => {
      if (!effectiveQuery) {
        setError("Enter skills, experience, or a job description before searching.");
        return;
      }

      const includeRelatedValue = options?.includeRelatedOverride ?? includeRelated;

      setIsLoading(true);
      setError(null);
      setActionMessage(null);
      setLastSearchMeta(null);
      closeDetail();

      const started = performance.now();

      try {
        const searchRequest: TalentLensSearchRequest = {
          query: effectiveQuery,
          top_k: getSearchTopK(topK, gradYearFilter),
          min_score: 0,
          include_related: includeRelatedValue,
          input_mode: inputMode,
          recruiter_company: inputMode === "Job Description" ? recruiterCompany.trim() || null : null,
          recruiter_job_title:
            inputMode === "Job Description" ? recruiterJobTitle.trim() || null : null,
        };
        const searchResponse = await searchTalentLens(searchRequest);
        setLastSearchRequest(searchRequest);
        setResponse(searchResponse);
        setFocusedIndex(0);
        const filteredCount = prepareSearchResults(
          searchResponse.results,
          gradYearFilter,
          topK
        ).length;
        setLastSearchMeta({
          count: filteredCount,
          elapsedMs: Math.round(performance.now() - started),
          totalBeforeFilter: gradYearFilterActive
            ? filterCandidatesByGradYear(searchResponse.results, gradYearFilter).length
            : undefined,
        });
        addRecentQuery(effectiveQuery, inputMode);
      } catch (searchError) {
        setResponse(null);
        setError(searchError instanceof Error ? searchError.message : "Search failed unexpectedly.");
      } finally {
        setIsLoading(false);
      }
    },
    [
      addRecentQuery,
      closeDetail,
      effectiveQuery,
      gradYearFilter,
      gradYearFilterActive,
      includeRelated,
      inputMode,
      recruiterCompany,
      recruiterJobTitle,
      topK,
    ]
  );

  const handleIncludeRelatedChange = useCallback(
    (next: boolean) => {
      setIncludeRelated(next);
      if (response && effectiveQuery) {
        void runSearch({ includeRelatedOverride: next });
      }
    },
    [effectiveQuery, response, runSearch]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSuggestionsOpen(false);
    await runSearch();
  };

  const openSavedCandidate = (candidateId: string) => {
    const candidate = resolveCandidateById(candidateId);
    if (candidate) openCandidate(candidate);
  };

  const openFeedback = useCallback(
    (preselectedRankedTooHigh?: TalentLensCandidateResult | null) => {
      if (!response || !lastSearchRequest || !effectiveQuery) {
        setActionMessage("Run a search first, then report feedback on those results.");
        return;
      }
      setFeedbackContext({
        queryText: effectiveQuery,
        inputMode,
        searchRequest: lastSearchRequest,
        response,
        gradYearFilter,
        lastSearchMeta,
        results: rawResults,
        preselectedRankedTooHigh,
      });
    },
    [
      effectiveQuery,
      gradYearFilter,
      inputMode,
      lastSearchMeta,
      lastSearchRequest,
      rawResults,
      response,
    ]
  );

  const resultsSummary = useMemo(() => {
    if (lastSearchMeta) {
      const verifiedLabel =
        matchSummary && matchSummary.related_count > 0
          ? `${matchSummary.verified_count} verified + ${matchSummary.related_count} similar`
          : matchSummary
            ? `${matchSummary.verified_count} verified match${matchSummary.verified_count === 1 ? "" : "es"}`
            : `${lastSearchMeta.count} result${lastSearchMeta.count === 1 ? "" : "s"}`;
      const filteredNote =
        gradYearFilterActive &&
        lastSearchMeta.totalBeforeFilter !== undefined &&
        lastSearchMeta.totalBeforeFilter !== lastSearchMeta.count
          ? ` (from ${lastSearchMeta.totalBeforeFilter} before graduation filter)`
          : gradYearFilterActive && response
            ? ` (graduation year filter active)`
            : "";
      return `${verifiedLabel}${filteredNote} in ${msFormatter.format(lastSearchMeta.elapsedMs)} ms`;
    }
    if (results.length) {
      return `${results.length} ranked candidate${results.length === 1 ? "" : "s"} returned`;
    }
    if (response && rawResults.length && gradYearFilterActive) {
      return "No candidates match the graduation year filter.";
    }
    return "Results will appear here after a search.";
  }, [gradYearFilterActive, lastSearchMeta, matchSummary, rawResults.length, response, results.length]);

  const searchFieldWrapper = (children: ReactNode) => (
    <div className="relative">
      {children}
      <SearchSuggestions
        isOpen={isSuggestionsOpen}
        inputValue={query}
        inputMode={inputMode}
        recentQueries={recentQueries}
        activeIndex={suggestionActiveIndex}
        listboxId={suggestionsListboxId}
        onSelect={applySuggestion}
        onActiveIndexChange={setSuggestionActiveIndex}
        onClose={() => setIsSuggestionsOpen(false)}
      />
    </div>
  );

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
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3 border-b border-(--obs-border) pb-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-(--obs-text-primary)">Search setup</p>
                  <p className="mt-1 text-sm text-(--obs-text-muted)">
                    Choose a skills search or paste a full job description.
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-(--obs-text-muted)">Input mode</span>
                  <div className="grid grid-cols-2 rounded-lg border border-(--obs-border) bg-(--obs-surface) p-1">
                    {(["Skills", "Job Description"] as TalentLensInputMode[]).map(mode => (
                      <button
                        key={mode}
                        type="button"
                        className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                          inputMode === mode
                            ? "bg-[#19B5CA] text-[#061019]"
                            : "text-(--obs-text-muted) hover:text-(--obs-text-primary)"
                        }`}
                        onClick={() => {
                          if (mode !== inputMode) {
                            setQuery("");
                          }
                          setInputMode(mode);
                          setActionMessage(null);
                          setIsSuggestionsOpen(false);
                        }}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {inputMode === "Skills" ? (
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="flex flex-col gap-4">
                    <label className="flex flex-col gap-2">
                      <FieldLabel>Skills or experience</FieldLabel>
                      {searchFieldWrapper(
                        <input
                          ref={searchInputRef}
                          className="w-full rounded-lg border border-(--obs-border) bg-(--obs-surface) px-4 py-3 text-base text-(--obs-text-primary) outline-none transition placeholder:text-(--obs-text-faint) focus:border-[#19B5CA]/55"
                          value={query}
                          onChange={event => {
                            setQuery(event.target.value);
                            setSuggestionActiveIndex(0);
                          }}
                          onFocus={() => setIsSuggestionsOpen(true)}
                          onBlur={() => setTimeout(() => setIsSuggestionsOpen(false), 150)}
                          onKeyDown={handleSearchFieldKeyDown}
                          placeholder="React, TypeScript, machine learning"
                          role="combobox"
                          aria-expanded={isSuggestionsOpen}
                          aria-controls={suggestionsListboxId}
                          aria-autocomplete="list"
                        />
                      )}
                    </label>

                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <FieldLabel>Skill filters</FieldLabel>
                        {selectedSkills.length ? (
                          <button
                            type="button"
                            className="text-xs font-semibold text-[#F58134] hover:underline"
                            onClick={clearSelectedSkills}
                          >
                            Clear skills
                          </button>
                        ) : null}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {skillSuggestions.map(skill => {
                          const isActive = selectedSkills.includes(skill);
                          return (
                            <button
                              key={skill}
                              type="button"
                              className={`rounded-md border px-3 py-2 text-sm transition ${
                                isActive
                                  ? "border-[#19B5CA]/55 bg-[#19B5CA]/15 text-[#8eeaf4]"
                                  : "border-(--obs-border) bg-transparent text-(--obs-text-muted) hover:border-[#19B5CA]/45 hover:text-(--obs-text-primary)"
                              }`}
                              onClick={() => toggleSkill(skill)}
                              aria-pressed={isActive}
                            >
                              {skill}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="grid content-start gap-4">
                    <SearchControls
                      topK={topK}
                      includeRelated={includeRelated}
                      gradYearFilter={gradYearFilter}
                      graduationYearOptions={graduationYearOptions}
                      setTopK={setTopK}
                      setIncludeRelated={handleIncludeRelatedChange}
                      setGradYearFilter={setGradYearFilter}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <label className="flex flex-col gap-2">
                    <FieldLabel>Job description</FieldLabel>
                    {searchFieldWrapper(
                      <textarea
                        ref={jdTextareaRef}
                        className="min-h-56 w-full resize-y rounded-lg border border-(--obs-border) bg-(--obs-surface) px-4 py-3 text-base leading-7 text-(--obs-text-primary) outline-none transition placeholder:text-(--obs-text-faint) focus:border-[#19B5CA]/55"
                        value={query}
                        onChange={event => {
                          setQuery(event.target.value);
                          setSuggestionActiveIndex(0);
                        }}
                        onFocus={() => setIsSuggestionsOpen(true)}
                        onBlur={() => setTimeout(() => setIsSuggestionsOpen(false), 150)}
                        onKeyDown={handleSearchFieldKeyDown}
                        placeholder="Paste a job description or requirements..."
                        role="combobox"
                        aria-expanded={isSuggestionsOpen}
                        aria-controls={suggestionsListboxId}
                        aria-autocomplete="list"
                      />
                    )}
                  </label>

                  <div className="grid content-start gap-4">
                    <label className="flex flex-col gap-2">
                      <FieldLabel>Recruiter company</FieldLabel>
                      <input
                        className="rounded-lg border border-(--obs-border) bg-(--obs-surface) px-3 py-2 text-(--obs-text-primary) outline-none placeholder:text-(--obs-text-faint) focus:border-[#19B5CA]/55"
                        value={recruiterCompany}
                        onChange={event => setRecruiterCompany(event.target.value)}
                        placeholder="Optional company override"
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <FieldLabel>Recruiter job title</FieldLabel>
                      <input
                        className="rounded-lg border border-(--obs-border) bg-(--obs-surface) px-3 py-2 text-(--obs-text-primary) outline-none placeholder:text-(--obs-text-faint) focus:border-[#19B5CA]/55"
                        value={recruiterJobTitle}
                        onChange={event => setRecruiterJobTitle(event.target.value)}
                        placeholder="Optional title override"
                      />
                    </label>

                    <SearchControls
                      topK={topK}
                      includeRelated={includeRelated}
                      gradYearFilter={gradYearFilter}
                      graduationYearOptions={graduationYearOptions}
                      setTopK={setTopK}
                      setIncludeRelated={handleIncludeRelatedChange}
                      setGradYearFilter={setGradYearFilter}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-(--obs-border) pt-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 text-sm text-(--obs-text-muted)">
                  <FiSliders aria-hidden />
                  <span>Scores and evidence are returned by the TalentLens API.</span>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-(--obs-border) bg-transparent px-5 py-3 font-semibold text-(--obs-text-primary) transition hover:border-[#F58134]/50 hover:bg-[#F58134]/10"
                    onClick={handleClear}
                  >
                    <FiX aria-hidden />
                    Clear
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F58134] px-5 py-3 font-semibold text-white transition hover:bg-[#f06f1d] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isLoading}
                  >
                    {isLoading ? "Searching..." : "Search TalentLens"}
                    <FiArrowRight aria-hidden />
                  </button>
                </div>
              </div>
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
                <p className="mt-1 text-sm text-(--obs-text-muted)">{resultsSummary}</p>
                {results.length ? (
                  <p className="mt-1 text-xs text-(--obs-text-faint)">
                    Use ↑↓ to browse, Enter to view details
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md border border-(--obs-border) bg-(--obs-surface) px-3 py-2 text-sm font-medium text-(--obs-text-primary) transition hover:border-[#F58134]/45 hover:bg-[#F58134]/10"
                  onClick={() => setIsSavedPanelOpen(true)}
                >
                  <FiBookmark aria-hidden />
                  Saved ({saved.length})
                </button>
                {response ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-md border border-(--obs-border) bg-(--obs-surface) px-3 py-2 text-sm font-medium text-(--obs-text-primary) transition hover:border-[#F58134]/45 hover:bg-[#F58134]/10"
                    onClick={() => openFeedback()}
                  >
                    <FiMessageSquare aria-hidden />
                    Report issue
                  </button>
                ) : null}
                {results.length ? (
                  <>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-md border border-(--obs-border) bg-(--obs-surface) px-3 py-2 text-sm font-medium text-(--obs-text-primary) transition hover:border-[#19B5CA]/45 hover:bg-[#19B5CA]/10"
                      onClick={copyEmails}
                    >
                      <FiClipboard aria-hidden />
                      Copy emails
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-md border border-(--obs-border) bg-(--obs-surface) px-3 py-2 text-sm font-medium text-(--obs-text-primary) transition hover:border-[#19B5CA]/45 hover:bg-[#19B5CA]/10"
                      onClick={exportContacts}
                    >
                      <FiDownload aria-hidden />
                      Export CSV
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-md border border-(--obs-border) bg-(--obs-surface) px-3 py-2 text-sm font-medium text-(--obs-text-primary) transition hover:border-[#19B5CA]/45 hover:bg-[#19B5CA]/10"
                      onClick={exportJson}
                    >
                      <FiDownload aria-hidden />
                      Export JSON
                    </button>
                  </>
                ) : null}
              </div>
            </div>

            {actionMessage ? (
              <p className="rounded-md border border-[#19B5CA]/25 bg-[#19B5CA]/10 px-3 py-2 text-sm text-(--obs-text-primary)">
                {actionMessage}
              </p>
            ) : null}

            {parsedQuerySignals.length ? (
              <div className="rounded-lg border border-(--obs-border) bg-(--obs-surface) p-4">
                <p className="text-sm font-semibold text-(--obs-text-primary)">
                  TalentLens understood
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {parsedQuerySignals.map(signal => (
                    <Chip key={signal}>{signal}</Chip>
                  ))}
                </div>
              </div>
            ) : null}

            {isLoading ? <LoadingState /> : null}
            {error && !isLoading ? <ErrorState message={error} /> : null}
            {!isLoading && !error && !response ? <EmptyState onPickSearch={setQuery} /> : null}
            {!isLoading && !error && response && !results.length ? (
              <section className="rounded-lg border border-(--obs-border) bg-(--obs-surface) p-6">
                <p className="font-semibold text-(--obs-text-primary)">
                  {rawResults.length && gradYearFilterActive
                    ? "No candidates in this graduation year range"
                    : "No matches found"}
                </p>
                <p className="mt-2 text-sm leading-6 text-(--obs-text-muted)">
                  {rawResults.length && gradYearFilterActive
                    ? "Widen the graduation year range, clear the filter, or run a new search with a higher Top K."
                    : "Try broadening the skills or switching input mode."}
                </p>
              </section>
            ) : null}

            {!isLoading && !error && results.length ? (
              <div className="grid gap-5">
                {matchSummary &&
                matchSummary.verified_count < matchSummary.requested_top_k &&
                !includeRelated ? (
                  <p className="rounded-md border border-[#F58134]/25 bg-[#F58134]/10 px-3 py-2 text-sm text-(--obs-text-primary)">
                    Only {matchSummary.verified_count} verified match
                    {matchSummary.verified_count === 1 ? "" : "es"} for this query (you asked for{" "}
                    {matchSummary.requested_top_k}). Turn on &quot;Include similar candidates&quot;
                    to explore related profiles.
                  </p>
                ) : null}
                {matchSummary &&
                includeRelated &&
                matchSummary.related_count === 0 &&
                matchSummary.verified_count < matchSummary.requested_top_k ? (
                  <p className="rounded-md border border-(--obs-border) bg-(--obs-surface) px-3 py-2 text-sm text-(--obs-text-muted)">
                    No additional similar candidates ranked for this query (only{" "}
                    {matchSummary.verified_count} verified
                    {matchSummary.verified_count === 1 ? "" : " matches"} in the search pool).
                  </p>
                ) : null}

                {verifiedResults.length ? (
                  <div className="grid gap-5">
                    {relatedResults.length ? (
                      <h3 className="text-lg font-semibold text-(--obs-text-primary)">
                        Verified matches
                      </h3>
                    ) : null}
                    {verifiedResults.map((candidate, index) => (
                      <CandidateCard
                        key={getCandidateStorageId(candidate)}
                        candidate={candidate}
                        index={index}
                        isFocused={index === focusedIndex}
                        isSaved={isSaved(candidate)}
                        setCardRef={setCardRef}
                        onOpen={() => {
                          setFocusedIndex(index);
                          openCandidate(candidate);
                        }}
                        onToggleSaved={() => {
                          const added = toggleSaved(candidate);
                          setActionMessage(added ? "Saved candidate." : "Removed from saved.");
                        }}
                        onReportIssue={() => openFeedback(candidate)}
                      />
                    ))}
                  </div>
                ) : null}

                {relatedResults.length ? (
                  <div className="grid gap-5">
                    <div>
                      <h3 className="text-lg font-semibold text-(--obs-text-primary)">
                        Similar candidates
                      </h3>
                      <p className="mt-1 text-sm text-(--obs-text-muted)">
                        Not fully verified for your requirements — ranked below verified matches.
                      </p>
                    </div>
                    {relatedResults.map((candidate, index) => {
                      const resultIndex = verifiedResults.length + index;
                      return (
                        <CandidateCard
                          key={getCandidateStorageId(candidate)}
                          candidate={candidate}
                          index={resultIndex}
                          isFocused={resultIndex === focusedIndex}
                          isSaved={isSaved(candidate)}
                          setCardRef={setCardRef}
                          onOpen={() => {
                            setFocusedIndex(resultIndex);
                            openCandidate(candidate);
                          }}
                          onToggleSaved={() => {
                            const added = toggleSaved(candidate);
                            setActionMessage(added ? "Saved candidate." : "Removed from saved.");
                          }}
                          onReportIssue={() => openFeedback(candidate)}
                        />
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>
        </section>
      </main>

      {detailCandidate ? (
        <CandidateDetailModal
          candidate={detailCandidate}
          onClose={closeDetail}
          onActionMessage={setActionMessage}
        />
      ) : null}

      <SavedCandidatesPanel
        isOpen={isSavedPanelOpen}
        saved={saved}
        onClose={() => setIsSavedPanelOpen(false)}
        onOpenCandidate={candidateId => {
          openSavedCandidate(candidateId);
          setIsSavedPanelOpen(false);
        }}
        onUnsave={unsave}
        onClearAll={clearAll}
        onActionMessage={setActionMessage}
      />

      {feedbackContext && user?.email ? (
        <FeedbackModal
          context={feedbackContext}
          reporterEmail={user.email}
          reporterRole={reporterRole}
          onClose={() => setFeedbackContext(null)}
          onSuccess={setActionMessage}
        />
      ) : null}
    </Page>
  );
};

const SearchControls = ({
  topK,
  includeRelated,
  gradYearFilter,
  graduationYearOptions,
  setTopK,
  setIncludeRelated,
  setGradYearFilter,
}: {
  topK: number;
  includeRelated: boolean;
  gradYearFilter: GraduationYearFilter;
  graduationYearOptions: number[];
  setTopK: (value: number) => void;
  setIncludeRelated: (value: boolean) => void;
  setGradYearFilter: (value: GraduationYearFilter) => void;
}) => {
  const [topKInput, setTopKInput] = useState(String(topK));

  useEffect(() => {
    setTopKInput(String(topK));
  }, [topK]);

  const commitTopK = () => {
    const parsed = Number(topKInput);
    if (!Number.isFinite(parsed) || topKInput.trim() === "") {
      setTopKInput(String(topK));
      return;
    }
    const clamped = clampTopK(parsed);
    setTopK(clamped);
    setTopKInput(String(clamped));
  };

  return (
  <div className="flex flex-col gap-4">
    <label className="flex flex-col gap-2">
      <FieldLabel>Top K</FieldLabel>
      <input
        className="rounded-lg border border-(--obs-border) bg-(--obs-surface) px-3 py-2 text-(--obs-text-primary) outline-none focus:border-[#19B5CA]/55"
        type="number"
        min={5}
        max={50}
        inputMode="numeric"
        value={topKInput}
        onChange={event => setTopKInput(event.target.value)}
        onBlur={commitTopK}
        onKeyDown={event => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
        }}
      />
    </label>
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-(--obs-border) bg-(--obs-surface) px-3 py-3">
      <input
        type="checkbox"
        className="mt-1"
        checked={includeRelated}
        onChange={event => setIncludeRelated(event.target.checked)}
      />
      <span className="text-sm leading-6 text-(--obs-text-primary)">
        Include similar candidates
        <span className="mt-0.5 block text-xs text-(--obs-text-muted)">
          On by default — fill remaining slots with related profiles. Uncheck for verified-only
          results.
        </span>
      </span>
    </label>
    <GraduationYearFilterPanel
      value={gradYearFilter}
      yearOptions={graduationYearOptions}
      onChange={setGradYearFilter}
    />
  </div>
  );
};

export default TalentLens;
