import { GRADUATION_FILTER_API_TOP_K, GRADUATION_YEAR_SELECT_OPTIONS } from "./constants";
import { getCandidateStorageId } from "./storage";
import type {
  GraduationYearFilter,
  TalentLensCandidateResult,
  TalentLensEvidenceChunk,
  TalentLensRankingDetails,
} from "./types";

const GRAD_YEAR_PATTERN = /\b(19|20)\d{2}\b/;

export const parseGraduationYear = (value: string | null | undefined): number | null => {
  if (!value) return null;
  const match = String(value).match(GRAD_YEAR_PATTERN);
  if (!match) return null;
  const year = Number(match[0]);
  return Number.isFinite(year) ? year : null;
};

export const isGraduationYearFilterActive = (filter: GraduationYearFilter) =>
  filter.years.length > 0 || filter.includeUnknown;

export const matchesGraduationYearFilter = (
  graduationYear: string | null | undefined,
  filter: GraduationYearFilter
) => {
  if (!isGraduationYearFilterActive(filter)) return true;

  const parsed = parseGraduationYear(graduationYear);

  if (parsed === null) {
    return filter.includeUnknown;
  }

  if (!filter.years.length) {
    return false;
  }

  return filter.years.includes(parsed);
};

export const filterCandidatesByGradYear = (
  candidates: TalentLensCandidateResult[],
  filter: GraduationYearFilter
) =>
  candidates.filter(candidate =>
    matchesGraduationYearFilter(candidate.graduation_year, filter)
  );

/** Apply grad-year filter, then cap to the UI Top K (API may return more when filtering). */
export const prepareSearchResults = (
  candidates: TalentLensCandidateResult[],
  filter: GraduationYearFilter,
  topK: number
) => filterCandidatesByGradYear(candidates, filter).slice(0, topK);

/** Clamp UI/API top_k to the supported range (backend enforces the same bounds). */
export const clampTopK = (value: number) => Math.min(50, Math.max(5, Math.trunc(value)));

/** Fetch up to 50 from API when filtering client-side; otherwise use the display limit. */
export const getSearchTopK = (displayTopK: number, gradYearFilter: GraduationYearFilter) => {
  if (!isGraduationYearFilterActive(gradYearFilter)) return displayTopK;
  return GRADUATION_FILTER_API_TOP_K;
};

export const toggleGraduationYear = (filter: GraduationYearFilter, year: number): GraduationYearFilter => {
  const years = filter.years.includes(year)
    ? filter.years.filter(item => item !== year)
    : [...filter.years, year].sort((a, b) => a - b);
  return { ...filter, years };
};

export const toggleGraduationUnknown = (filter: GraduationYearFilter): GraduationYearFilter => ({
  ...filter,
  includeUnknown: !filter.includeUnknown,
});

export const collectGraduationYearOptions = (
  candidates: TalentLensCandidateResult[]
): number[] => {
  const years = new Set<number>(GRADUATION_YEAR_SELECT_OPTIONS);
  for (const candidate of candidates) {
    const year = parseGraduationYear(candidate.graduation_year);
    if (year !== null) years.add(year);
  }
  return Array.from(years).sort((a, b) => a - b);
};

export const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
  style: "percent",
});

export const msFormatter = new Intl.NumberFormat("en-US");

export const formatFitScore = (score: number | null | undefined) => {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return "N/A";
  }
  const rounded = Math.round(score);
  return `${rounded}/100`;
};

export const formatScore = (score: number | null | undefined) => {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return "N/A";
  }

  if (score > 1) {
    return formatFitScore(score);
  }

  return percentFormatter.format(score);
};

export const compactList = (items: string[] | null | undefined) =>
  Array.isArray(items) ? items.filter(Boolean) : [];

export const getEvidenceText = (chunk: TalentLensEvidenceChunk) => chunk.text || "";

export const getEvidenceChunks = (candidate: TalentLensCandidateResult, limit?: number) => {
  const chunks = (candidate.top_evidence_chunks || [])
    .map(chunk => getEvidenceText(chunk))
    .filter(Boolean);
  return limit ? chunks.slice(0, limit) : chunks;
};

const getEvidenceCorpus = (candidate: TalentLensCandidateResult) =>
  getEvidenceChunks(candidate).join(" ");

const normalizeProfileUrl = (value: string | null | undefined, domain: string) => {
  if (!value) return "";
  const trimmed = value.trim().replace(/[),.;]+$/, "");
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith(domain)) return `https://${trimmed}`;
  return "";
};

const extractEmail = (candidate: TalentLensCandidateResult) => {
  if (candidate.email) return candidate.email;
  return getEvidenceCorpus(candidate).match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
};

const extractLinkedin = (candidate: TalentLensCandidateResult) => {
  const explicit = normalizeProfileUrl(candidate.linkedin, "linkedin.com");
  if (explicit) return explicit;
  const match = getEvidenceCorpus(candidate).match(
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s|,)]+/i
  );
  return normalizeProfileUrl(match?.[0], "linkedin.com");
};

const extractGithub = (candidate: TalentLensCandidateResult) => {
  const explicit = normalizeProfileUrl(candidate.github, "github.com");
  if (explicit) return explicit;
  const match = getEvidenceCorpus(candidate).match(
    /(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s|,)]+/i
  );
  return normalizeProfileUrl(match?.[0], "github.com");
};

const getResumeLink = (candidate: TalentLensCandidateResult) => {
  if (candidate.resume_link?.startsWith("http")) return candidate.resume_link;
  if (candidate.file_path?.startsWith("http")) return candidate.file_path;
  return "";
};

export const getCandidateContact = (candidate: TalentLensCandidateResult) => ({
  name: candidate.full_name || candidate.filename || `Candidate ${candidate.rank}`,
  email: extractEmail(candidate),
  linkedin: extractLinkedin(candidate),
  github: extractGithub(candidate),
  resume: getResumeLink(candidate),
});

export const getCandidateDisplayName = (candidate: TalentLensCandidateResult) =>
  candidate.full_name || candidate.filename || `Candidate ${candidate.rank}`;

export const escapeCsvCell = (value: string | number | null | undefined) =>
  `"${String(value ?? "").replace(/"/g, '""')}"`;

export const downloadCsv = (filename: string, rows: string[][]) => {
  const csv = rows.map(row => row.map(escapeCsvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const buildCandidateExportRows = (candidates: TalentLensCandidateResult[]) =>
  candidates.map(candidate => {
    const contact = getCandidateContact(candidate);
    return {
      rank: candidate.rank,
      name: contact.name,
      email: contact.email,
      linkedin: contact.linkedin,
      github: contact.github,
      resume_link: contact.resume,
    };
  });

export const exportCandidatesCsv = (
  candidates: TalentLensCandidateResult[],
  filename = "talentlens-candidates.csv"
) => {
  downloadCsv(filename, [
    ["rank", "name", "email", "linkedin", "github", "resume_link"],
    ...buildCandidateExportRows(candidates).map(row => [
      String(row.rank),
      row.name,
      row.email,
      row.linkedin,
      row.github,
      row.resume_link,
    ]),
  ]);
};

export const exportCandidatesJson = (
  candidates: TalentLensCandidateResult[],
  filename = "talentlens-candidates.json"
) => {
  const payload = buildCandidateExportRows(candidates);
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const formatStatus = (status: string | Record<string, unknown> | null | undefined) => {
  if (!status) return "";
  if (typeof status === "string") return status;

  const entries = Object.entries(status)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => `${key}: ${String(value)}`);

  return entries.join(", ");
};

export const shouldShowStatus = (status: string | null | undefined) =>
  Boolean(status && !["not_requested", "skipped", "unavailable", "none", "error"].includes(status));

export const formatEngineMode = (modeLabel: string | undefined) => {
  if (!modeLabel) return "";
  if (modeLabel.toLowerCase() === "fallback") return "Keyword fallback mode";
  return modeLabel;
};

export const formatRetrievalBackend = (backend: string | undefined) => {
  if (!backend) return "";
  if (backend === "lexical-chunk") return "Resume text chunk search";
  return backend;
};

export const getProfileShareUrl = (candidate: TalentLensCandidateResult) => {
  const id = encodeURIComponent(getCandidateStorageId(candidate));
  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.ds3atucsd.com";
  return `${origin}/talentlens?candidate=${id}`;
};

export const formatRankingDetails = (details: TalentLensRankingDetails | null | undefined) => {
  if (!details || typeof details !== "object") return [];
  return Object.entries(details)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => ({ key, value: String(value) }));
};
