import { FiBookmark, FiExternalLink, FiGithub, FiLinkedin } from "react-icons/fi";

import type { TalentLensCandidateResult } from "../types";
import {
  compactList,
  formatFitScore,
  formatStatus,
  getCandidateContact,
  getCandidateDisplayName,
  getEvidenceChunks,
  shouldShowStatus,
} from "../utils";
import { ActionLink, Chip, ScoreTile } from "./ui";

interface CandidateCardProps {
  candidate: TalentLensCandidateResult;
  index: number;
  isFocused: boolean;
  isSaved: boolean;
  setCardRef: (index: number) => (node: HTMLElement | null) => void;
  onToggleSaved: () => void;
}

const CandidateCard = ({
  candidate,
  index,
  isFocused,
  isSaved,
  setCardRef,
  onToggleSaved,
}: CandidateCardProps) => {
  const matchedSkills = compactList(candidate.matched_skills);
  const evidenceChunks = getEvidenceChunks(candidate, 3);
  const displayName = getCandidateDisplayName(candidate);
  const hardFilterStatus = formatStatus(candidate.hard_filter_status);
  const contact = getCandidateContact(candidate);
  const hasActions = Boolean(contact.resume || contact.linkedin || contact.github);

  return (
    <article
      ref={setCardRef(index)}
      data-talentlens-result-index={index}
      tabIndex={-1}
      className={`rounded-lg border bg-[rgba(255,255,255,0.045)] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.18)] transition ${
        candidate.match_tier === "related" ? "opacity-90 " : ""
      }${
        isFocused
          ? "border-[#19B5CA]/65 ring-2 ring-[#19B5CA]/35"
          : candidate.match_tier === "related"
            ? "border-[#F58134]/35"
            : "border-(--obs-border)"
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone="orange">Rank {candidate.rank}</Chip>
            {candidate.match_tier === "related" ? (
              <Chip tone="orange">Similar</Chip>
            ) : null}
            {shouldShowStatus(candidate.company_match_status) ? (
              <Chip>{candidate.company_match_status}</Chip>
            ) : null}
          </div>
          <h3 className="mt-3 text-2xl font-semibold leading-tight text-(--obs-text-primary)">
            {displayName}
          </h3>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-(--obs-text-muted)">
            {candidate.major ? <span>{candidate.major}</span> : null}
            {candidate.graduation_year ? <span>Class of {candidate.graduation_year}</span> : null}
            {contact.email ? <span>{contact.email}</span> : null}
            {candidate.page_count ? <span>{candidate.page_count} resume page(s)</span> : null}
          </div>
        </div>
        <div className="flex items-start gap-2">
          <ScoreTile label="Fit" value={formatFitScore(candidate.score)} />
          <button
            type="button"
            aria-label={isSaved ? "Unsave candidate" : "Save candidate"}
            className={`rounded-md border p-2 transition ${
              isSaved
                ? "border-[#F58134]/55 bg-[#F58134]/15 text-[#ffbd89]"
                : "border-(--obs-border) text-(--obs-text-muted) hover:border-[#F58134]/45 hover:text-(--obs-text-primary)"
            }`}
            onClick={event => {
              event.stopPropagation();
              onToggleSaved();
            }}
          >
            <FiBookmark className={isSaved ? "fill-current" : ""} aria-hidden />
          </button>
        </div>
      </div>

      {hasActions ? (
        <div className="mt-5 flex flex-wrap gap-2">
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
        </div>
      ) : null}

      {matchedSkills.length ? (
        <div className="mt-5">
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
        <div className="mt-5 rounded-lg border border-[#19B5CA]/20 bg-[#19B5CA]/10 p-4">
          <p className="text-sm font-semibold text-(--obs-text-primary)">Why selected</p>
          <p className="mt-2 text-sm leading-6 text-(--obs-text-muted)">
            {candidate.explanation.why_selected}
          </p>
        </div>
      ) : null}

      {evidenceChunks.length ? (
        <div className="mt-5">
          <p className="text-sm font-semibold text-(--obs-text-primary)">
            Why this candidate matched
          </p>
          <div className="mt-3 space-y-3">
            {evidenceChunks.map((chunk, chunkIndex) => (
              <blockquote
                key={`${candidate.candidate_id}-evidence-${chunkIndex}`}
                className="rounded-lg border-l-2 border-[#F58134] bg-(--obs-surface) px-4 py-3 text-sm leading-6 text-(--obs-text-muted)"
              >
                {chunk}
              </blockquote>
            ))}
          </div>
        </div>
      ) : null}

      {hardFilterStatus ? (
        <p className="mt-5 text-xs text-(--obs-text-faint)">Filter status: {hardFilterStatus}</p>
      ) : null}
    </article>
  );
};

export default CandidateCard;
