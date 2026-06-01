import type { RecentQuery, SavedCandidateSnapshot, TalentLensCandidateResult } from "./types";

export const RECENT_QUERIES_KEY = "talentlens:recent-queries";
export const SAVED_CANDIDATES_KEY = "talentlens:saved-candidates";

export const MAX_RECENT_QUERIES = 8;

const readJson = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // private browsing or quota exceeded
  }
};

export const getCandidateStorageId = (candidate: TalentLensCandidateResult) =>
  candidate.candidate_id || candidate.filename;

export const loadRecentQueries = (): RecentQuery[] =>
  readJson<RecentQuery[]>(RECENT_QUERIES_KEY, []);

export const saveRecentQuery = (entry: Omit<RecentQuery, "at">) => {
  const trimmed = entry.query.trim();
  if (!trimmed) return;

  const next: RecentQuery = { ...entry, query: trimmed, at: Date.now() };
  const deduped = loadRecentQueries().filter(
    item => !(item.query === next.query && item.inputMode === next.inputMode)
  );
  writeJson(RECENT_QUERIES_KEY, [next, ...deduped].slice(0, MAX_RECENT_QUERIES));
};

export const loadSavedCandidates = (): SavedCandidateSnapshot[] =>
  readJson<SavedCandidateSnapshot[]>(SAVED_CANDIDATES_KEY, []);

export const persistSavedCandidates = (snapshots: SavedCandidateSnapshot[]) => {
  writeJson(SAVED_CANDIDATES_KEY, snapshots);
};
