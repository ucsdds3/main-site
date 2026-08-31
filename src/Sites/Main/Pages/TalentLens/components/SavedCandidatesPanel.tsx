import { FiBookmark, FiDownload, FiTrash2, FiX } from "react-icons/fi";

import type { SavedCandidateSnapshot } from "../types";
import { exportCandidatesCsv, formatFitScore, getCandidateDisplayName } from "../utils";
import { Chip } from "./ui";

interface SavedCandidatesPanelProps {
  isOpen: boolean;
  saved: SavedCandidateSnapshot[];
  onClose: () => void;
  onUnsave: (candidateId: string) => void;
  onClearAll: () => void;
  onActionMessage?: (message: string) => void;
}

const SavedCandidatesPanel = ({
  isOpen,
  saved,
  onClose,
  onUnsave,
  onClearAll,
  onActionMessage,
}: SavedCandidatesPanelProps) => {
  if (!isOpen) return null;

  const exportSaved = () => {
    if (!saved.length) return;
    exportCandidatesCsv(
      saved.map(item => item.candidate),
      "talentlens-saved-candidates.csv"
    );
    onActionMessage?.("Exported saved candidates CSV.");
  };

  return (
    <div className="obs-event-modal-overlay" onClick={onClose}>
      <aside
        className="fixed right-0 top-0 z-50 flex h-full w-[min(420px,92vw)] flex-col border-l border-(--obs-border) bg-[#0b1220] shadow-[-12px_0_40px_rgba(0,0,0,0.35)]"
        onClick={event => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="talentlens-saved-title"
      >
        <div className="flex items-center justify-between border-b border-(--obs-border) px-4 py-4">
          <div className="flex items-center gap-2">
            <FiBookmark className="text-[#F58134]" aria-hidden />
            <h2 id="talentlens-saved-title" className="text-lg font-semibold text-(--obs-text-primary)">
              Saved candidates ({saved.length})
            </h2>
          </div>
          <button
            type="button"
            className="rounded-md border border-(--obs-border) p-2 text-(--obs-text-muted) hover:text-(--obs-text-primary)"
            onClick={onClose}
            aria-label="Close saved panel"
          >
            <FiX aria-hidden />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-(--obs-border) px-4 py-3">
          {saved.length ? (
            <>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-(--obs-border) px-3 py-2 text-sm text-(--obs-text-primary) hover:border-[#19B5CA]/45"
                onClick={exportSaved}
              >
                <FiDownload aria-hidden />
                Export saved CSV
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-[#ff6b6b]/35 px-3 py-2 text-sm text-[#ff8f8f] hover:bg-[#ff6b6b]/10"
                onClick={onClearAll}
              >
                <FiTrash2 aria-hidden />
                Clear all
              </button>
            </>
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {!saved.length ? (
            <p className="text-sm leading-6 text-(--obs-text-muted)">
              Bookmark candidates from search results to review them here later.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {saved.map(item => (
                <li
                  key={item.candidate_id}
                  className="rounded-lg border border-(--obs-border) bg-(--obs-surface) p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-(--obs-text-primary)">
                        {getCandidateDisplayName(item.candidate)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.candidate.rank ? (
                          <Chip tone="orange">Rank {item.candidate.rank}</Chip>
                        ) : null}
                        <Chip>{formatFitScore(item.candidate.score)}</Chip>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-xs font-semibold text-[#F58134] hover:underline"
                      onClick={() => onUnsave(item.candidate_id)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
};

export default SavedCandidatesPanel;
