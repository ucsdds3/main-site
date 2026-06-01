export type TalentLensInputMode = "Skills" | "Job Description";

export interface TalentLensSearchRequest {
  query: string;
  top_k: number;
  min_score: number;
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
  section_type?: string;
  score?: number;
  text?: string;
}

export interface TalentLensCandidateResult {
  rank: number;
  filename: string;
  candidate_id: string;
  score: number | null;
  semantic_score: number | null;
  file_path: string | null;
  full_name: string | null;
  major: string | null;
  graduation_year: string | null;
  matched_skills: string[];
  top_evidence_chunks: Array<string | TalentLensEvidenceChunk>;
  hard_filter_status: string | Record<string, unknown> | null;
  ranking_details: Record<string, unknown>;
  page_count: number | null;
  company_match_status: string | null;
  grok_status: string | null;
  grok_fit_score: number | null;
  grok_resume_quality_score: number | null;
  grok_summary: string | null;
  grok_matched_requirements: string[];
  grok_missing_requirements: string[];
  grok_weakness_flags: string[];
}

export interface TalentLensSearchResponse {
  parsed_job_description: string | null;
  engine_status: TalentLensEngineStatus | null;
  results: TalentLensCandidateResult[];
}
