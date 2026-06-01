import { useEffect, useMemo, useRef } from "react";
import { FiClock } from "react-icons/fi";

import { skillSuggestions, suggestedSearches } from "../constants";
import type { RecentQuery, TalentLensInputMode } from "../types";

export type SuggestionItem =
  | { type: "recent"; label: string; query: string; inputMode: TalentLensInputMode }
  | { type: "suggestion"; label: string; query: string };

interface SearchSuggestionsProps {
  isOpen: boolean;
  inputValue: string;
  inputMode: TalentLensInputMode;
  recentQueries: RecentQuery[];
  activeIndex: number;
  listboxId: string;
  onSelect: (item: SuggestionItem) => void;
  onActiveIndexChange: (index: number) => void;
  onClose: () => void;
}

const matchesPrefix = (value: string, needle: string) => {
  if (!needle) return true;
  return value.toLowerCase().includes(needle.toLowerCase());
};

export const buildSuggestionItems = (
  inputValue: string,
  inputMode: TalentLensInputMode,
  recentQueries: RecentQuery[]
): SuggestionItem[] => {
  const needle = inputValue.trim();
  const recent: SuggestionItem[] = recentQueries
    .filter(item => item.inputMode === inputMode && matchesPrefix(item.query, needle))
    .map(item => ({
      type: "recent" as const,
      label: item.query,
      query: item.query,
      inputMode: item.inputMode,
    }));

  const staticPool = [...skillSuggestions, ...suggestedSearches];
  const suggestions: SuggestionItem[] = staticPool
    .filter(label => matchesPrefix(label, needle))
    .filter(label => !recent.some(item => item.query === label))
    .slice(0, 8)
    .map(label => ({ type: "suggestion" as const, label, query: label }));

  return [...recent, ...suggestions];
};

const SearchSuggestions = ({
  isOpen,
  inputValue,
  inputMode,
  recentQueries,
  activeIndex,
  listboxId,
  onSelect,
  onActiveIndexChange,
  onClose,
}: SearchSuggestionsProps) => {
  const listRef = useRef<HTMLUListElement>(null);

  const items = useMemo(
    () => buildSuggestionItems(inputValue, inputMode, recentQueries),
    [inputMode, inputValue, recentQueries]
  );

  useEffect(() => {
    if (!isOpen) return;
    const node = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    node?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, isOpen]);

  if (!isOpen || !items.length) return null;

  const recentItems = items.filter(item => item.type === "recent");
  const suggestionItems = items.filter(item => item.type === "suggestion");

  let runningIndex = 0;

  const renderItem = (item: SuggestionItem) => {
    const index = runningIndex++;
    const isActive = index === activeIndex;

    return (
      <li key={`${item.type}-${item.query}-${index}`} role="presentation">
        <button
          type="button"
          role="option"
          aria-selected={isActive}
          data-index={index}
          id={`${listboxId}-option-${index}`}
          className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition ${
            isActive
              ? "bg-[#19B5CA]/15 text-(--obs-text-primary)"
              : "text-(--obs-text-muted) hover:bg-[#19B5CA]/10 hover:text-(--obs-text-primary)"
          }`}
          onMouseDown={event => event.preventDefault()}
          onMouseEnter={() => onActiveIndexChange(index)}
          onClick={() => {
            onSelect(item);
            onClose();
          }}
        >
          {item.type === "recent" ? (
            <FiClock className="shrink-0 text-[#19B5CA]" aria-hidden />
          ) : null}
          <span className="truncate">{item.label}</span>
        </button>
      </li>
    );
  };

  return (
    <ul
      ref={listRef}
      id={listboxId}
      role="listbox"
      className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-lg border border-(--obs-border) bg-[#0b1220] py-1 shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
    >
      {recentItems.length ? (
        <li className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-(--obs-text-faint)">
          Recent
        </li>
      ) : null}
      {recentItems.map(renderItem)}
      {suggestionItems.length ? (
        <li className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-(--obs-text-faint)">
          Suggestions
        </li>
      ) : null}
      {suggestionItems.map(renderItem)}
    </ul>
  );
};

export default SearchSuggestions;
