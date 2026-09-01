import type {
  FeedbackContext,
  FeedbackFormState,
  FeedbackSubmitPayload,
} from "./feedbackTypes";
import { RANKING_CATEGORIES } from "./feedbackTypes";
import { getCandidateStorageId } from "./storage";
import type { TalentLensCandidateResult } from "./types";
import { getCandidateDisplayName } from "./utils";

const EVIDENCE_TEXT_LIMIT = 400;

export const slimCandidateSnapshot = (candidate: TalentLensCandidateResult) => ({
  rank: candidate.rank,
  candidate_id: candidate.candidate_id,
  full_name: candidate.full_name,
  filename: candidate.filename,
  score: candidate.score,
  match_tier: candidate.match_tier,
  hard_filter_status: candidate.hard_filter_status,
  verification: candidate.verification,
  ranking_details: candidate.ranking_details,
  explanation: candidate.explanation,
  matched_skills: candidate.matched_skills,
  top_evidence_chunks: candidate.top_evidence_chunks.map(chunk => ({
    chunk_id: chunk.chunk_id,
    section_type: chunk.section_type,
    score: chunk.score,
    text: chunk.text.slice(0, EVIDENCE_TEXT_LIMIT),
  })),
});

export const buildFeedbackDebugBundle = (context: FeedbackContext) => ({
  submitted_at: new Date().toISOString(),
  search_request: context.searchRequest,
  grad_year_filter: context.gradYearFilter,
  search_meta: context.lastSearchMeta,
  parsed_query: context.response.parsed_query,
  match_summary: context.response.match_summary,
  engine_status: context.response.engine_status,
  results_top10: context.response.results.slice(0, 10).map(slimCandidateSnapshot),
});

export const buildInitialFeedbackForm = (): FeedbackFormState => ({
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
});

export const findCandidateByStorageId = (
  results: TalentLensCandidateResult[],
  storageId: string
) => results.find(candidate => getCandidateStorageId(candidate) === storageId) ?? null;

export const buildFeedbackPayload = (
  form: FeedbackFormState,
  context: FeedbackContext,
  reporterEmail: string,
  reporterRole: string | null
): FeedbackSubmitPayload | { error: string } => {
  if (!form.category) return { error: "Select what went wrong." };
  if (!form.confidence) return { error: "Select how confident you are." };
  if (!form.impact) return { error: "Select the impact if this is real." };

  const rankedTooHigh = form.rankedTooHighCandidateId
    ? findCandidateByStorageId(context.results, form.rankedTooHighCandidateId)
    : null;

  const expectedFromList = form.expectedCandidateId
    ? findCandidateByStorageId(context.results, form.expectedCandidateId)
    : null;

  const needsComparison =
    RANKING_CATEGORIES.includes(form.category) && !form.noGoodResults;

  if (needsComparison) {
    const hasExpected =
      expectedFromList ||
      form.expectedCandidateName.trim() ||
      form.reportingAboutSelf;
    if (!hasExpected) {
      return { error: "Name who should have ranked higher or checked “reporting about myself”." };
    }
    if (
      (form.category === "wrong_rank" || form.category === "verification_wrong") &&
      !rankedTooHigh
    ) {
      return { error: "Select who ranked too high." };
    }
    if (!form.expectedEvidence.trim() && !form.whyWrong.trim()) {
      return {
        error: "Briefly describe the evidence or why the ranking looks wrong.",
      };
    }
  }

  const expectedRank = form.expectedNotShown
    ? "not_shown"
    : expectedFromList
      ? String(expectedFromList.rank)
      : form.expectedRank.trim() || null;

  const expectedName =
    expectedFromList
      ? getCandidateDisplayName(expectedFromList)
      : form.expectedCandidateName.trim() || null;

  return {
    reporter_email: reporterEmail.toLowerCase(),
    reporter_role: reporterRole,
    category: form.category,
    confidence: form.confidence,
    impact: form.impact,
    query_text: context.queryText,
    input_mode: context.inputMode,
    no_good_results: form.noGoodResults,
    expected_candidate_id: expectedFromList?.candidate_id ?? null,
    expected_candidate_name: expectedName,
    expected_rank: expectedRank,
    ranked_too_high_candidate_id: rankedTooHigh?.candidate_id ?? null,
    ranked_too_high_candidate_name: rankedTooHigh
      ? getCandidateDisplayName(rankedTooHigh)
      : null,
    expected_evidence: form.expectedEvidence.trim() || null,
    why_wrong: form.whyWrong.trim() || null,
    notes: form.notes.trim() || null,
    reporting_about_self: form.reportingAboutSelf,
    search_request: { ...context.searchRequest },
    debug_bundle: buildFeedbackDebugBundle(context),
  };
};
