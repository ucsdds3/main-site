import { useEffect, useId, useMemo, useRef, useState } from "react";

import { Input } from "src/Sites/Members/Components/Input";
import { normalizeExternalHref } from "src/Utils/functions";
import {
  mostRecentExperienceLine,
  testimonialPreview,
  type WhereWeAreMemberFields,
} from "src/Utils/whereWeAre";

import { searchWhereWeAreMembers } from "../Hooks/useWhereWeAreAdmin";

type Props = {
  excludeMemberIds: number[];
  onSelect: (member: WhereWeAreMemberFields) => void;
};

export default function MemberSearchPicker({ excludeMemberIds, onSelect }: Props) {
  const excludeIds = useMemo(() => new Set(excludeMemberIds), [excludeMemberIds]);
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WhereWeAreMemberFields[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const rows = await searchWhereWeAreMembers(query, excludeIds);
        setResults(rows);
        setOpen(rows.length > 0);
      } catch {
        setResults([]);
        setOpen(false);
      } finally {
        setSearching(false);
      }
    }, 280);

    return () => window.clearTimeout(timer);
  }, [query, excludeIds]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const pick = (member: WhereWeAreMemberFields) => {
    onSelect(member);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative w-full max-w-xl">
      <Input
        label="Search members"
        fieldId="where-we-are-member-search"
        hideLabel
        type="search"
        placeholder="Search by name…"
        value={query}
        setValue={setQuery}
        className="min-w-0 w-full max-w-xl"
        onFocus={() => results.length > 0 && setOpen(true)}
        autoComplete="off"
        aria-controls={listId}
        aria-expanded={open}
      />
      {searching ? (
        <p className="mt-2 text-sm text-(--obs-text-faint)">Searching…</p>
      ) : null}
      {open && results.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-2 max-h-[min(420px,60vh)] w-full overflow-y-auto rounded-xl border border-(--obs-border) bg-(--obs-surface) shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
        >
          {results.map(member => {
            const photo = normalizeExternalHref(member.profile_picture);
            const experience = mostRecentExperienceLine(member.experiences);
            const blurb = testimonialPreview(member.testimonial);

            return (
              <li key={member.id} role="option">
                <button
                  type="button"
                  className="flex w-full cursor-pointer gap-3 border-b border-(--obs-border) p-3 text-left transition-colors last:border-b-0 hover:bg-[rgba(25,181,202,0.06)]"
                  onClick={() => pick(member)}
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-(--obs-border) bg-(--obs-surface-raised)">
                    {photo ? (
                      <img src={photo} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="flex size-full items-center justify-center text-xs text-(--obs-text-faint)">
                        No photo
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 font-semibold text-(--obs-text-primary)">
                      {member.full_name?.trim() || "Member"}
                    </p>
                    {experience ? (
                      <p className="m-0 mt-0.5 text-sm text-[#19B5CA]">{experience}</p>
                    ) : null}
                    {blurb ? (
                      <p className="m-0 mt-1 line-clamp-3 text-sm leading-snug text-(--obs-text-muted)">
                        {blurb}
                      </p>
                    ) : (
                      <p className="m-0 mt-1 text-sm italic text-(--obs-text-faint)">
                        No testimonial yet
                      </p>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      {open && !searching && query.trim() && results.length === 0 ? (
        <p className="absolute z-20 mt-2 w-full rounded-xl border border-(--obs-border) bg-(--obs-surface) p-3 text-sm text-(--obs-text-muted)">
          No members found
        </p>
      ) : null}
    </div>
  );
}
