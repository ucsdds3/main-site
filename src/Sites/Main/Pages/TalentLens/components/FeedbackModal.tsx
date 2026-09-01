import { useEffect, useMemo, useRef, useState } from "react";
import { FiAlertCircle } from "react-icons/fi";

import { submitTalentLensFeedback } from "../feedbackApi";
import {
  FEEDBACK_CATEGORY_OPTIONS,
  RANKING_CATEGORIES,
  type FeedbackContext,
  type FeedbackFormState,
} from "../feedbackTypes";
import {
  buildFeedbackPayload,
  buildInitialFeedbackForm,
} from "../feedbackUtils";
import { getCandidateStorageId } from "../storage";
import { getCandidateDisplayName } from "../utils";
import { FieldLabel } from "./ui";

interface FeedbackModalProps {
  context: FeedbackContext;
  reporterEmail: string;
  reporterRole: string | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const selectClassName =
  "w-full rounded-lg border border-(--obs-border) bg-(--obs-surface) px-3 py-2 text-sm text-(--obs-text-primary) outline-none focus:border-[#19B5CA]/55";

const textAreaClassName =
  "w-full rounded-lg border border-(--obs-border) bg-(--obs-surface) px-3 py-2 text-sm leading-6 text-(--obs-text-primary) outline-none focus:border-[#19B5CA]/55";

const FeedbackModal = ({
  context,
  reporterEmail,
  reporterRole,
  onClose,
  onSuccess,
}: FeedbackModalProps) => {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [form, setForm] = useState<FeedbackFormState>(buildInitialFeedbackForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const candidateOptions = useMemo(
    () =>
      context.results.map(candidate => ({
        id: getCandidateStorageId(candidate),
        label: `#${candidate.rank} — ${getCandidateDisplayName(candidate)}`,
        candidate,
      })),
    [context.results]
  );

  const showComparisonFields =
    form.category !== "" &&
    RANKING_CATEGORIES.includes(form.category) &&
    !form.noGoodResults;

  useEffect(() => {
    closeRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting, onClose]);

  const updateForm = (patch: Partial<FeedbackFormState>) => {
    setForm(current => ({ ...current, ...patch }));
    setError(null);
  };

  const handleSubmit = async () => {
    const payload = buildFeedbackPayload(form, context, reporterEmail, reporterRole);
    if ("error" in payload) {
      setError(payload.error);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await submitTalentLensFeedback(payload);
      onSuccess("Thanks — your feedback was submitted. We use these reports to find pipeline bugs.");
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not submit feedback. Try again or contact the DS3 team."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="obs-event-modal-overlay" onClick={() => !isSubmitting && onClose()}>
      <div
        className="obs-event-modal max-h-[90vh] w-[min(720px,94vw)] overflow-y-auto"
        onClick={event => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="talentlens-feedback-title"
      >
        <div className="flex flex-col gap-4 px-[1.15rem] pb-[1.2rem] pt-[1.1rem]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#19B5CA]">
                Beta feedback
              </p>
              <h3
                id="talentlens-feedback-title"
                className="mt-1 font-heading text-2xl leading-tight text-(--obs-text-primary)"
              >
                Report a search issue
              </h3>
              <p className="mt-2 text-sm leading-6 text-(--obs-text-muted)">
                Help us find ranking, verification, and data bugs. Your search context is attached
                automatically.
              </p>
            </div>
            <button
              ref={closeRef}
              type="button"
              className="obs-event-modal-close shrink-0"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Close
            </button>
          </div>

          <div className="rounded-lg border border-(--obs-border) bg-(--obs-surface) p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-(--obs-text-faint)">
              Search snapshot
            </p>
            <p className="mt-2 text-sm font-medium text-(--obs-text-primary)">
              {context.queryText}
            </p>
            <p className="mt-1 text-xs text-(--obs-text-muted)">
              {context.inputMode} · Top {context.searchRequest.top_k} ·{" "}
              {context.searchRequest.include_related ? "includes similar" : "verified only"}
            </p>
          </div>

          <label className="flex flex-col gap-2">
            <FieldLabel>What went wrong?</FieldLabel>
            <select
              className={selectClassName}
              value={form.category}
              onChange={event =>
                updateForm({
                  category: event.target.value as FeedbackFormState["category"],
                })
              }
            >
              <option value="">Select an issue type…</option>
              {FEEDBACK_CATEGORY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {form.category ? (
              <p className="text-xs text-(--obs-text-muted)">
                {FEEDBACK_CATEGORY_OPTIONS.find(option => option.value === form.category)?.hint}
              </p>
            ) : null}
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-(--obs-border) bg-(--obs-surface) px-3 py-3">
            <input
              type="checkbox"
              className="mt-1"
              checked={form.noGoodResults}
              onChange={event => updateForm({ noGoodResults: event.target.checked })}
            />
            <span className="text-sm leading-6 text-(--obs-text-primary)">
              No good results at all
              <span className="mt-0.5 block text-xs text-(--obs-text-muted)">
                Check this if the problem is empty or irrelevant results, not ordering.
              </span>
            </span>
          </label>

          {showComparisonFields ? (
            <div className="grid gap-4 rounded-lg border border-[#F58134]/25 bg-[#F58134]/5 p-4">
              <p className="text-sm font-semibold text-(--obs-text-primary)">
                Comparison (helps us reproduce)
              </p>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={form.reportingAboutSelf}
                  onChange={event =>
                    updateForm({ reportingAboutSelf: event.target.checked })
                  }
                />
                <span className="text-sm leading-6 text-(--obs-text-primary)">
                  I&apos;m reporting about myself or my own resume
                </span>
              </label>

              <label className="flex flex-col gap-2">
                <FieldLabel>Who should have ranked higher?</FieldLabel>
                <select
                  className={selectClassName}
                  value={form.expectedCandidateId}
                  onChange={event => {
                    const nextId = event.target.value;
                    const match = candidateOptions.find(option => option.id === nextId);
                    updateForm({
                      expectedCandidateId: nextId,
                      expectedNotShown: false,
                      expectedRank: match ? String(match.candidate.rank) : form.expectedRank,
                      expectedCandidateName: match
                        ? getCandidateDisplayName(match.candidate)
                        : form.expectedCandidateName,
                    });
                  }}
                >
                  <option value="">Pick from results or name below…</option>
                  {candidateOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <input
                  className={selectClassName}
                  type="text"
                  placeholder="Or type a name not in results"
                  value={form.expectedCandidateName}
                  onChange={event =>
                    updateForm({
                      expectedCandidateName: event.target.value,
                      expectedCandidateId: "",
                    })
                  }
                />
              </label>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={form.expectedNotShown}
                  onChange={event =>
                    updateForm({
                      expectedNotShown: event.target.checked,
                      expectedCandidateId: "",
                      expectedRank: "",
                    })
                  }
                />
                <span className="text-sm leading-6 text-(--obs-text-primary)">
                  Not shown in my results at all
                </span>
              </label>

              {!form.expectedNotShown && !form.expectedCandidateId ? (
                <label className="flex flex-col gap-2">
                  <FieldLabel>Their rank (if shown)</FieldLabel>
                  <input
                    className={selectClassName}
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 8"
                    value={form.expectedRank}
                    onChange={event => updateForm({ expectedRank: event.target.value })}
                  />
                </label>
              ) : null}

              {form.category === "wrong_rank" || form.category === "verification_wrong" ? (
                <label className="flex flex-col gap-2">
                  <FieldLabel>Who ranked too high instead?</FieldLabel>
                  <select
                    className={selectClassName}
                    value={form.rankedTooHighCandidateId}
                    onChange={event =>
                      updateForm({ rankedTooHighCandidateId: event.target.value })
                    }
                  >
                    <option value="">Select a candidate…</option>
                    {candidateOptions.slice(0, 10).map(option => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <label className="flex flex-col gap-2">
                <FieldLabel>Evidence that supports the expected person</FieldLabel>
                <textarea
                  className={textAreaClassName}
                  rows={2}
                  placeholder='e.g. "Software Engineering Intern @ Google, Summer 2025" on their resume'
                  value={form.expectedEvidence}
                  onChange={event => updateForm({ expectedEvidence: event.target.value })}
                />
              </label>

              <label className="flex flex-col gap-2">
                <FieldLabel>Why the other result is wrong (if applicable)</FieldLabel>
                <textarea
                  className={textAreaClassName}
                  rows={2}
                  placeholder='e.g. "Only mentions Google Developer Student Club, not an internship"'
                  value={form.whyWrong}
                  onChange={event => updateForm({ whyWrong: event.target.value })}
                />
              </label>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <FieldLabel>Confidence this is a bug</FieldLabel>
              <select
                className={selectClassName}
                value={form.confidence}
                onChange={event =>
                  updateForm({
                    confidence: event.target.value as FeedbackFormState["confidence"],
                  })
                }
              >
                <option value="">Select…</option>
                <option value="high">High — clear resume evidence</option>
                <option value="medium">Medium — plausible</option>
                <option value="low">Low — gut feel</option>
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <FieldLabel>Impact if real</FieldLabel>
              <select
                className={selectClassName}
                value={form.impact}
                onChange={event =>
                  updateForm({
                    impact: event.target.value as FeedbackFormState["impact"],
                  })
                }
              >
                <option value="">Select…</option>
                <option value="high">High — blocks trust</option>
                <option value="medium">Medium — annoying</option>
                <option value="low">Low — minor</option>
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <FieldLabel>Anything else? (optional)</FieldLabel>
            <textarea
              className={textAreaClassName}
              rows={2}
              placeholder="Steps to reproduce, screenshots described, etc."
              value={form.notes}
              onChange={event => updateForm({ notes: event.target.value })}
            />
          </label>

          {error ? (
            <div className="flex gap-3 rounded-md border border-[#ff6b6b]/35 bg-[#ff6b6b]/10 px-3 py-2">
              <FiAlertCircle className="mt-0.5 shrink-0 text-[#ff8f8f]" aria-hidden />
              <p className="text-sm text-(--obs-text-primary)">{error}</p>
            </div>
          ) : null}

          <div className="flex flex-wrap justify-end gap-2 border-t border-(--obs-border) pt-4">
            <button
              type="button"
              className="rounded-md border border-(--obs-border) px-4 py-2 text-sm text-(--obs-text-primary) hover:border-[#19B5CA]/45"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-md border border-[#19B5CA]/45 bg-[#19B5CA]/15 px-4 py-2 text-sm font-medium text-[#8eeaf4] transition hover:bg-[#19B5CA]/25 disabled:opacity-60"
              onClick={() => void handleSubmit()}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting…" : "Submit feedback"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
