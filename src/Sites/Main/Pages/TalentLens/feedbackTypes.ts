import type {
  GraduationYearFilter,
  SearchTimingMeta,
  TalentLensCandidateResult,
  TalentLensInputMode,
  TalentLensSearchRequest,
  TalentLensSearchResponse,
} from "./types";

export type FeedbackCategory =
  | "wrong_rank"
  | "missing_candidate"
  | "verification_wrong"
  | "explanation_wrong"
  | "hard_filter_wrong"
  | "profile_data_wrong"
  | "ui_bug"
  | "other";

export type FeedbackConfidence = "high" | "medium" | "low";
export type FeedbackImpact = "high" | "medium" | "low";

export interface FeedbackFormState {
  category: FeedbackCategory | "";
  confidence: FeedbackConfidence | "";
  impact: FeedbackImpact | "";
  noGoodResults: boolean;
  expectedCandidateId: string;
  expectedCandidateName: string;
  expectedNotShown: boolean;
  expectedRank: string;
  rankedTooHighCandidateId: string;
  expectedEvidence: string;
  whyWrong: string;
  notes: string;
  reportingAboutSelf: boolean;
}

export interface FeedbackSubmitPayload {
  reporter_email: string;
  reporter_role: string | null;
  category: FeedbackCategory;
  confidence: FeedbackConfidence;
  impact: FeedbackImpact;
  query_text: string;
  input_mode: TalentLensInputMode;
  no_good_results: boolean;
  expected_candidate_id: string | null;
  expected_candidate_name: string | null;
  expected_rank: string | null;
  ranked_too_high_candidate_id: string | null;
  ranked_too_high_candidate_name: string | null;
  expected_evidence: string | null;
  why_wrong: string | null;
  notes: string | null;
  reporting_about_self: boolean;
  search_request: Record<string, unknown>;
  debug_bundle: Record<string, unknown>;
}

export interface FeedbackContext {
  queryText: string;
  inputMode: TalentLensInputMode;
  searchRequest: TalentLensSearchRequest;
  response: TalentLensSearchResponse;
  gradYearFilter: GraduationYearFilter;
  lastSearchMeta: SearchTimingMeta | null;
  results: TalentLensCandidateResult[];
}

export const FEEDBACK_CATEGORY_OPTIONS: {
  value: FeedbackCategory;
  label: string;
  hint: string;
}[] = [
  {
    value: "wrong_rank",
    label: "Wrong ranking order",
    hint: "A weaker match ranked above a stronger one",
  },
  {
    value: "missing_candidate",
    label: "Good match missing",
    hint: "Someone who should appear is not in results",
  },
  {
    value: "verification_wrong",
    label: "Verification incorrect",
    hint: "Requirements marked yes/no incorrectly",
  },
  {
    value: "explanation_wrong",
    label: "Explanation unsupported",
    hint: "Summary claims something the resume does not support",
  },
  {
    value: "hard_filter_wrong",
    label: "Filter wrong",
    hint: "Grad year, major, or must-have skill filter issue",
  },
  {
    value: "profile_data_wrong",
    label: "Profile / resume data",
    hint: "Outdated, missing, or incorrect candidate info",
  },
  {
    value: "ui_bug",
    label: "UI or performance",
    hint: "Crash, timeout, broken link, display bug",
  },
  {
    value: "other",
    label: "Other",
    hint: "Something else worth reporting",
  },
];

export const RANKING_CATEGORIES: FeedbackCategory[] = [
  "wrong_rank",
  "missing_candidate",
  "verification_wrong",
];

export const EMPTY_FEEDBACK_FORM: FeedbackFormState = {
  category: "",
  confidence: "",
  impact: "",
  noGoodResults: false,
  expectedCandidateId: "",
  expectedCandidateName: "",
  expectedNotShown: false,
  expectedRank: "",
  rankedTooHighCandidateId: "",
  expectedEvidence: "",
  whyWrong: "",
  notes: "",
  reportingAboutSelf: false,
};
