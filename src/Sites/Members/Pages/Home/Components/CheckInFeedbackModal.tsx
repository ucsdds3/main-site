import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { TfiClose } from "react-icons/tfi";

import { supabase } from "src/Utils/supabase";

export type CheckInFeedbackTarget = {
  eventId: number;
  eventName: string;
};

type CheckInFeedbackModalProps = {
  target: CheckInFeedbackTarget | null;
  onClose: () => void;
  onSubmitted: () => void;
};

export default function CheckInFeedbackModal({
  target,
  onClose,
  onSubmitted,
}: CheckInFeedbackModalProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setRating(null);
    setFeedback("");
    setSubmitting(false);
  }, [target?.eventId]);

  if (!target) return null;

  const submit = async () => {
    if (rating == null) {
      toast.error("Please choose a rating from 1 to 10.");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc("submit_attendance_feedback", {
        p_event_id: target.eventId,
        p_rating: rating,
        p_feedback: feedback.trim() || null,
      });

      if (error) throw error;

      if (data === "ok") {
        toast.success("Thanks for your feedback!");
        onSubmitted();
        onClose();
        return;
      }
      if (data === "invalid_rating") toast.error("Rating must be between 1 and 10.");
      else if (data === "not_authenticated") toast.error("Please log in first.");
      else if (data === "member_not_found") toast.error("Your account is not linked to a profile.");
      else if (data === "not_checked_in")
        toast.error("Check in to this event before submitting feedback.");
      else toast.error("Could not save feedback. Try again.");
    } catch (err) {
      toast.error((err as Error).message || "Could not save feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4"
      style={{ background: "rgba(5, 8, 16, 0.78)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkin-feedback-title"
        className="w-[min(520px,94vw)] overflow-hidden rounded-2xl shadow-2xl"
        style={{
          fontFamily: "'Albert Sans', sans-serif",
          background: "#F7F8FA",
          color: "#0F172A",
          border: "1px solid rgba(15, 23, 42, 0.08)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="flex items-start justify-between gap-3 px-6 pt-5 pb-4"
          style={{ borderBottom: "1px solid rgba(15, 23, 42, 0.08)" }}
        >
          <div>
            <p
              className="m-0 mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em]"
              style={{ color: "#0e8fa0" }}
            >
              Checked in
            </p>
            <h2
              id="checkin-feedback-title"
              className="m-0 text-[1.45rem] leading-tight"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: "#0F172A" }}
            >
              How was this event?
            </h2>
            <p className="mt-2 mb-0 text-[0.95rem] leading-relaxed" style={{ color: "#334155" }}>
              <strong style={{ color: "#0F172A" }}>{target.eventName}</strong>
              <span className="mt-1 block">Rate 1–10 (required). Feedback is optional.</span>
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-9 shrink-0 items-center justify-center rounded-full transition-colors"
            style={{ color: "#475569", background: "rgba(15, 23, 42, 0.06)" }}
          >
            <TfiClose />
          </button>
        </div>

        <div className="px-6 py-5">
          <p
            className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.14em]"
            style={{ color: "#475569" }}
          >
            Rating
          </p>
          <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Event rating 1 to 10">
            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => {
              const selected = rating === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className="flex size-10 items-center justify-center rounded-xl text-sm font-semibold transition-colors"
                  style={{
                    background: selected ? "#F58134" : "#FFFFFF",
                    color: selected ? "#FFFFFF" : "#0F172A",
                    border: selected
                      ? "1px solid #F58134"
                      : "1px solid rgba(15, 23, 42, 0.18)",
                  }}
                  aria-pressed={selected}
                >
                  {n}
                </button>
              );
            })}
          </div>

          <label
            htmlFor="checkin-event-feedback"
            className="mb-2 block text-[0.72rem] font-bold uppercase tracking-[0.14em]"
            style={{ color: "#475569" }}
          >
            Feedback (optional)
          </label>
          <textarea
            id="checkin-event-feedback"
            rows={4}
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="Anything we should know?"
            className="mb-5 w-full resize-y rounded-xl px-3 py-2.5 text-[0.95rem] leading-snug outline-none"
            style={{
              background: "#FFFFFF",
              color: "#0F172A",
              border: "1px solid rgba(15, 23, 42, 0.18)",
            }}
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
              style={{ background: "#F58134" }}
              disabled={submitting || rating == null}
              onClick={() => void submit()}
            >
              {submitting ? "Saving…" : "Submit feedback"}
            </button>
            <button
              type="button"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold"
              style={{ background: "rgba(15, 23, 42, 0.06)", color: "#0F172A" }}
              disabled={submitting}
              onClick={onClose}
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
