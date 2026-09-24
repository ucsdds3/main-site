import { useState } from "react";
import toast from "react-hot-toast";
import { TfiClose } from "react-icons/tfi";

import {
  getEventsIcsFeedUrl,
  getGoogleCalendarAddByUrlPage,
  getWebcalSubscribeUrl,
} from "src/Utils/calendarSubscribe";

type CalendarSubscribeModalProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * High-contrast subscribe helper: shows ICS URL + copy confirmation.
 * Google’s cid= deep link does not work for arbitrary ICS feeds.
 */
export default function CalendarSubscribeModal({ open, onClose }: CalendarSubscribeModalProps) {
  const icsUrl = getEventsIcsFeedUrl();
  const webcalUrl = getWebcalSubscribeUrl(icsUrl);
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const copyLink = async () => {
    if (!icsUrl) {
      toast.error("Calendar feed is not configured.");
      return;
    }
    try {
      await navigator.clipboard.writeText(icsUrl);
      setCopied(true);
      toast.success("Calendar link copied to clipboard");
      window.setTimeout(() => setCopied(false), 6000);
    } catch {
      toast.error("Could not copy — select the link and copy manually.");
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
        aria-labelledby="calendar-subscribe-title"
        className="w-[min(540px,94vw)] overflow-hidden rounded-2xl shadow-2xl"
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
              DS3 events
            </p>
            <h2
              id="calendar-subscribe-title"
              className="m-0 text-[1.45rem] leading-tight"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: "#0F172A" }}
            >
              Add our event calendar
            </h2>
            <p className="mt-2 mb-0 text-[0.95rem] leading-relaxed" style={{ color: "#334155" }}>
              Subscribe once. When we publish an event as Complete, it can show up after your
              calendar refreshes the feed.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-9 shrink-0 items-center justify-center rounded-full transition-colors"
            style={{ color: "#475569", background: "rgba(15, 23, 42, 0.06)" }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(15, 23, 42, 0.12)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(15, 23, 42, 0.06)";
            }}
          >
            <TfiClose />
          </button>
        </div>

        <div className="px-6 py-5">
          <label
            className="mb-2 block text-[0.72rem] font-bold uppercase tracking-[0.14em]"
            style={{ color: "#475569" }}
            htmlFor="ds3-calendar-link"
          >
            Calendar link
          </label>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-stretch">
            <textarea
              id="ds3-calendar-link"
              readOnly
              rows={3}
              value={icsUrl || "Not configured — set VITE_SUPABASE_URL"}
              className="min-w-0 flex-1 resize-none rounded-xl px-3 py-2.5 font-mono text-[0.8rem] leading-snug outline-none"
              style={{
                background: "#FFFFFF",
                color: "#0F172A",
                border: "1px solid rgba(15, 23, 42, 0.18)",
                boxShadow: "inset 0 1px 2px rgba(15, 23, 42, 0.04)",
              }}
              onFocus={e => e.currentTarget.select()}
              aria-label="DS3 calendar ICS URL"
            />
            <button
              type="button"
              onClick={() => void copyLink()}
              className="shrink-0 rounded-xl px-5 py-3 text-sm font-semibold tracking-wide text-white transition-opacity"
              style={{ background: "#F58134" }}
              onMouseEnter={e => {
                e.currentTarget.style.opacity = "0.92";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              {copied ? "Copied!" : "Copy link"}
            </button>
          </div>

          {copied ? (
            <div
              role="status"
              aria-live="polite"
              className="mb-4 rounded-xl px-4 py-3 text-[0.95rem] leading-snug"
              style={{
                background: "rgba(25, 181, 202, 0.14)",
                border: "1px solid rgba(14, 143, 160, 0.45)",
                color: "#0F172A",
              }}
            >
              <strong style={{ color: "#0e8fa0" }}>Calendar link copied to clipboard.</strong>
              <span className="mt-1 block" style={{ color: "#334155" }}>
                Paste it into Google Calendar’s <strong>From URL</strong> field, then click Add
                calendar.
              </span>
            </div>
          ) : null}

          <ol className="m-0 mb-5 list-decimal space-y-2 pl-5 text-[0.95rem] leading-relaxed" style={{ color: "#1E293B" }}>
            <li>
              Click <strong>Copy link</strong>
            </li>
            <li>
              In Google Calendar: other calendars (+) → <strong>From URL</strong>
            </li>
            <li>
              Paste and click <strong>Add calendar</strong>
            </li>
          </ol>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
              style={{
                background: "#0F172A",
                color: "#FFFFFF",
              }}
              onClick={() => {
                void copyLink();
                window.open(getGoogleCalendarAddByUrlPage(), "_blank", "noopener,noreferrer");
              }}
              disabled={!icsUrl}
            >
              Open Google Calendar
            </button>
            {webcalUrl ? (
              <a
                href={webcalUrl}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold no-underline transition-colors"
                style={{
                  background: "rgba(15, 23, 42, 0.06)",
                  color: "#0F172A",
                }}
              >
                Apple / Outlook
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
