export type TalentLensInputMode = "Skills" | "Job Description";

/** Empty years + includeUnknown false = show all candidates. */
export interface GraduationYearFilter {
  years: number[];
  includeUnknown: boolean;
}

export const EMPTY_GRADUATION_YEAR_FILTER: GraduationYearFilter = {
  years: [],
  includeUnknown: false,
};

export interface TalentLensSearchRequest {
  query: string;
  top_k: number;
  min_score: number;
  include_related: boolean;
  input_mode: TalentLensInputMode;
  recruiter_company: string | null;
  recruiter_job_title: string | null;
}

export interface TalentLensEngineStatus {
  demo_mode: boolean;
  mode_label: string;
  retrieval_backend: string;
}

export interface TalentLensEvidenceChunk {
  section_type: string;
  score: number;
  text: string;
  chunk_id: string | null;
}

export interface TalentLensEngagementComponent {
  membership: number;
  role: number;
  events: number;
}

export interface TalentLensRankingDetails {
  dense_score: number | null;
  bm25_score: number | null;
  fusion_score: number | null;
  fit_score?: number | null;
  verification_component?: number | null;
  evidence_component?: number | null;
  retrieval_component?: number | null;
  semantic_coverage_bonus?: number | null;
  engagement_bonus?: number | null;
  engagement_component?: TalentLensEngagementComponent | null;
  final_score?: number | null;
  retrieval_raw?: number | null;
  overall_status?: string | null;
  score_cap_applied?: string | null;
}

export type TalentLensVerificationStatus = "yes" | "no" | "unclear";

export interface TalentLensRequirementVerification {
  requirement: string;
  status: TalentLensVerificationStatus;
  evidence_chunk_ids: string[];
  evidence_strength: string | null;
}

export interface TalentLensVerification {
  requirements: TalentLensRequirementVerification[];
}

export interface TalentLensExplanation {
  why_selected: string;
  matched: string[];
  gaps: string[];
}

export type TalentLensMatchTier = "verified" | "related";

export interface TalentLensCandidateResult {
  rank: number;
  filename: string;
  candidate_id: string;
  score: number | null;
  match_tier?: TalentLensMatchTier;
  semantic_score: number | null;
  file_path: string | null;
  full_name: string | null;
  major: string | null;
  graduation_year: string | null;
  email?: string | null;
  linkedin?: string | null;
  github?: string | null;
  resume_link?: string | null;
  local_resume_path?: string | null;
  matched_skills: string[];
  top_evidence_chunks: TalentLensEvidenceChunk[];
  hard_filter_status: "pass" | "fail";
  ranking_details: TalentLensRankingDetails | null;
  page_count: number | null;
  company_match_status: string | null;
  verification: TalentLensVerification | null;
  explanation: TalentLensExplanation | null;
}

export interface TalentLensParsedQuery {
  graduation_years: number[];
  must_have_skills: string[];
  semantic_requirements: string[];
  major_contains: string | null;
  exclusions: string[];
}

export interface TalentLensMatchSummary {
  requested_top_k: number;
  verified_count: number;
  related_count: number;
  returned_count: number;
}

export interface TalentLensSearchResponse {
  parsed_job_description: Record<string, unknown> | null;
  engine_status: TalentLensEngineStatus;
  results: TalentLensCandidateResult[];
  parsed_query: TalentLensParsedQuery | null;
  match_summary: TalentLensMatchSummary | null;
}

export interface TalentLensHealthResponse {
  status: "ok";
  service: string;
  version: string;
  index_ready: boolean;
  engine_loaded: boolean;
  candidate_count: number;
  indexed_chunk_count: number;
  retrieval_backend: string;
  demo_mode: boolean;
  mode_label: string;
  startup_issues: string[];
  engagement_snapshot_loaded?: boolean;
  engagement_member_count?: number;
}

export interface RecentQuery {
  query: string;
  inputMode: TalentLensInputMode;
  at: number;
}

export interface SavedCandidateSnapshot {
  candidate_id: string;
  savedAt: number;
  candidate: TalentLensCandidateResult;
}

export interface SearchTimingMeta {
  count: number;
  elapsedMs: number;
  totalBeforeFilter?: number;
}
