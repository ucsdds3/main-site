import { useEffect, useRef } from "react";
import { FiClipboard, FiExternalLink, FiGithub, FiLinkedin } from "react-icons/fi";

import type { TalentLensCandidateResult } from "../types";
import {
  compactList,
  formatFitScore,
  formatRankingDetails,
  formatScore,
  formatStatus,
  getCandidateContact,
  getCandidateDisplayName,
  getEvidenceChunks,
  getProfileShareUrl,
  shouldShowStatus,
} from "../utils";
import { ActionLink, Chip, RequirementList, ScoreTile } from "./ui";

interface CandidateDetailModalProps {
  candidate: TalentLensCandidateResult;
  onClose: () => void;
  onActionMessage?: (message: string) => void;
}

const CandidateDetailModal = ({
  candidate,
  onClose,
  onActionMessage,
}: CandidateDetailModalProps) => {
  const closeRef = useRef<HTMLButtonElement>(null);
  const matchedSkills = compactList(candidate.matched_skills);
  const matchedRequirements = compactList(candidate.explanation?.matched);
  const missingRequirements = compactList(candidate.explanation?.gaps);
  const verificationRequirements = candidate.verification?.requirements ?? [];
  const evidenceChunks = getEvidenceChunks(candidate, 5);
  const contact = getCandidateContact(candidate);
  const displayName = getCandidateDisplayName(candidate);
  const hardFilterStatus = formatStatus(candidate.hard_filter_status);
  const rankingDetails = formatRankingDetails(candidate.ranking_details);

  useEffect(() => {
    closeRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const copyProfileLink = async () => {
    const url = getProfileShareUrl(candidate);
    try {
      await navigator.clipboard.writeText(url);
      onActionMessage?.("Copied profile link.");
    } catch {
      onActionMessage?.(url);
    }
  };

  return (
    <div className="obs-event-modal-overlay" onClick={onClose}>
      <div
        className="obs-event-modal max-h-[90vh] w-[min(920px,94vw)] overflow-y-auto"
        onClick={event => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="talentlens-detail-title"
      >
        <div className="flex flex-col gap-[0.9rem] px-[1.15rem] pb-[1.2rem] pt-[1.1rem]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Chip tone="orange">Rank {candidate.rank}</Chip>
                {shouldShowStatus(candidate.company_match_status) ? (
                  <Chip>{candidate.company_match_status}</Chip>
                ) : null}
                {verificationRequirements.length ? (
                  <Chip tone="cyan">
                    {verificationRequirements.filter(item => item.status === "yes").length}/
                    {verificationRequirements.length} verified
                  </Chip>
                ) : null}
              </div>
              <h3
                id="talentlens-detail-title"
                className="mt-2 font-heading text-2xl leading-tight text-(--obs-text-primary)"
              >
                {displayName}
              </h3>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-(--obs-text-muted)">
                {candidate.major ? <span>{candidate.major}</span> : null}
                {candidate.graduation_year ? (
                  <span>Class of {candidate.graduation_year}</span>
                ) : null}
                {contact.email ? <span>{contact.email}</span> : null}
              </div>
            </div>
            <button
              ref={closeRef}
              type="button"
              className="obs-event-modal-close shrink-0"
              onClick={onClose}
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <ScoreTile label="Fit" value={formatFitScore(candidate.score)} />
            <ScoreTile label="Semantic" value={formatScore(candidate.semantic_score)} />
          </div>

          <div className="flex flex-wrap gap-2">
            <ActionLink href={contact.resume}>
              <FiExternalLink aria-hidden />
              View resume
            </ActionLink>
            <ActionLink href={contact.linkedin}>
              <FiLinkedin aria-hidden />
              LinkedIn
            </ActionLink>
            <ActionLink href={contact.github}>
              <FiGithub aria-hidden />
              GitHub
            </ActionLink>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-(--obs-border) bg-(--obs-surface) px-3 py-2 text-sm font-medium text-(--obs-text-primary) transition hover:border-[#19B5CA]/45 hover:bg-[#19B5CA]/10"
              onClick={copyProfileLink}
            >
              <FiClipboard aria-hidden />
              Copy profile link
            </button>
          </div>

          {matchedSkills.length ? (
            <div>
              <p className="text-sm font-semibold text-(--obs-text-primary)">Matched skills</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {matchedSkills.map(skill => (
                  <Chip key={skill} tone="cyan">
                    {skill}
                  </Chip>
                ))}
              </div>
            </div>
          ) : null}

          {candidate.explanation?.why_selected ? (
            <div className="rounded-lg border border-[#19B5CA]/20 bg-[#19B5CA]/10 p-4">
              <p className="text-sm font-semibold text-(--obs-text-primary)">Why selected</p>
              <p className="mt-2 text-sm leading-6 text-(--obs-text-muted)">
                {candidate.explanation.why_selected}
              </p>
            </div>
          ) : null}

          {evidenceChunks.length ? (
            <div>
              <p className="text-sm font-semibold text-(--obs-text-primary)">Resume evidence</p>
              <div className="mt-3 space-y-3">
                {evidenceChunks.map((chunk, chunkIndex) => (
                  <blockquote
                    key={`detail-evidence-${chunkIndex}`}
                    className="rounded-lg border-l-2 border-[#F58134] bg-(--obs-surface) px-4 py-3 text-sm leading-6 text-(--obs-text-muted)"
                  >
                    {chunk}
                  </blockquote>
                ))}
              </div>
            </div>
          ) : null}

          {matchedRequirements.length || missingRequirements.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {matchedRequirements.length ? (
                <RequirementList title="Requirements met" items={matchedRequirements} tone="cyan" />
              ) : null}
              {missingRequirements.length ? (
                <RequirementList title="Missing" items={missingRequirements} tone="orange" />
              ) : null}
            </div>
          ) : null}

          {verificationRequirements.length ? (
            <div>
              <p className="text-sm font-semibold text-(--obs-text-primary)">
                Requirement verification
              </p>
              <ul className="mt-3 grid gap-2">
                {verificationRequirements.map((item, index) => (
                  <li
                    key={`${item.requirement}-${index}`}
                    className="rounded-lg border border-(--obs-border) bg-(--obs-surface) p-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <span className="text-sm leading-6 text-(--obs-text-primary)">
                        {item.requirement}
                      </span>
                      <Chip
                        tone={
                          item.status === "yes"
                            ? "cyan"
                            : item.status === "no"
                              ? "orange"
                              : "neutral"
                        }
                      >
                        {item.status === "yes"
                          ? "Verified"
                          : item.status === "no"
                            ? "Not found"
                            : "Unclear"}
                      </Chip>
                    </div>
                    {item.evidence_strength ? (
                      <p className="mt-1 text-xs text-(--obs-text-faint)">
                        Evidence strength: {item.evidence_strength}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {rankingDetails.length ? (
            <div className="rounded-lg border border-(--obs-border) bg-(--obs-surface) p-4">
              <p className="text-sm font-semibold text-(--obs-text-primary)">Ranking details</p>
              <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                {rankingDetails.map(({ key, value }) => (
                  <div key={key}>
                    <dt className="text-xs text-(--obs-text-faint)">{key}</dt>
                    <dd className="text-sm text-(--obs-text-muted)">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          {hardFilterStatus ? (
            <p className="text-xs text-(--obs-text-faint)">Filter status: {hardFilterStatus}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailModal;
