import { useMemo, useState } from "react";

import type { SkillEvidenceLevel, SkillMatchResponse, SkillVerdictStatus } from "./api";

type Filter = "all" | "any" | "used" | "full";

const statusLabel: Record<SkillVerdictStatus, string> = {
  yes: "Supported",
  no: "Not found",
  unclear: "Unclear",
};

const levelLabel: Record<SkillEvidenceLevel, string> = {
  used: "Used",
  listed: "Listed",
  none: "",
};

const statusClass: Record<SkillVerdictStatus, string> = {
  yes: "text-emerald-400",
  no: "text-(--obs-text-muted)",
  unclear: "text-amber-300",
};

const SkillMatchResults = ({ result }: { result: SkillMatchResponse }) => {
  const [filter, setFilter] = useState<Filter>("all");
  const [nameQuery, setNameQuery] = useState("");

  const visible = useMemo(() => {
    const query = nameQuery.trim().toLowerCase();
    return result.results.filter(person => {
      if (filter === "any" && person.supported_count < 1) return false;
      if (filter === "used" && person.used_count < 1) return false;
      if (filter === "full" && person.supported_count < person.skill_count) return false;
      if (query && !person.display_name.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [filter, nameQuery, result.results]);

  return (
    <div className="obs-panel flex w-full flex-col gap-4 px-6 py-6" role="status" aria-live="polite">
      <h2 className="text-lg font-semibold text-(--obs-text-primary)">Skill check</h2>
      <p className="text-sm text-(--obs-text-muted)">
        Checked {result.skills.join(", ")} against {result.resumes_checked} other resumes.
        Engagement is off. {result.with_used_support} resumes used at least one skill in a project,
        job, or research entry. {result.with_any_support} have any support, including skills-list
        only. Listed-only people stay in the list, below used. The fit number is the existing
        recruiter fit for this run, not a teammate score.
      </p>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "Everyone"],
              ["used", "Used in work"],
              ["any", "Any support"],
              ["full", "All skills"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-wider ${
                filter === id
                  ? "border-[#19B5CA] bg-[rgba(25,181,202,0.15)] text-[#19B5CA]"
                  : "border-(--obs-border-mid) text-(--obs-text-muted)"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          value={nameQuery}
          onChange={event => setNameQuery(event.target.value)}
          placeholder="Find a name"
          className="obs-input-row min-h-10 flex-1 px-3 text-sm text-(--obs-text-primary)"
          aria-label="Find a name"
        />
      </div>

      <p className="text-sm text-(--obs-text-muted)">Showing {visible.length} resumes.</p>

      <div className="flex max-h-[70vh] flex-col gap-2 overflow-y-auto pr-1">
        {visible.map((person, index) => (
          <details
            key={`${person.display_name}-${index}`}
            className="rounded-lg border border-(--obs-border) bg-(--obs-surface) px-4 py-3"
          >
            <summary className="cursor-pointer text-(--obs-text-primary)">
              <span className="font-medium">{person.display_name}</span>
              <span className="ml-2 text-sm text-(--obs-text-muted)">
                used {person.used_count} · listed {person.listed_count} / {person.skill_count} ·
                provisional fit {person.provisional_fit}
              </span>
            </summary>
            <ul className="mt-3 flex flex-col gap-2">
              {person.skills.map(skill => (
                <li key={skill.name} className="text-sm">
                  <span className={statusClass[skill.status]}>
                    {statusLabel[skill.status]}
                    {levelLabel[skill.evidence_level]
                      ? ` · ${levelLabel[skill.evidence_level]}`
                      : ""}{" "}
                    · {skill.name}
                  </span>
                  {skill.evidence ? (
                    <p className="mt-1 text-(--obs-text-muted)">{skill.evidence}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
};

export default SkillMatchResults;
