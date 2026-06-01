import { useEffect, useRef } from "react";

import type { TalentLensCandidateResult } from "../types";

interface UseResultKeyboardNavOptions {
  results: TalentLensCandidateResult[];
  isEnabled: boolean;
  focusedIndex: number;
  setFocusedIndex: (index: number | ((prev: number) => number)) => void;
  onOpen: (candidate: TalentLensCandidateResult) => void;
  suggestionsOpen?: boolean;
}

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
};

export const useResultKeyboardNav = ({
  results,
  isEnabled,
  focusedIndex,
  setFocusedIndex,
  onOpen,
  suggestionsOpen = false,
}: UseResultKeyboardNavOptions) => {
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, results.length);
  }, [results.length]);

  useEffect(() => {
    if (!isEnabled || !results.length) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (suggestionsOpen) return;
      if (isTypingTarget(event.target)) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setFocusedIndex(prev => (prev + 1) % results.length);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setFocusedIndex(prev => (prev - 1 + results.length) % results.length);
        return;
      }

      if (event.key === "Enter" && focusedIndex >= 0 && focusedIndex < results.length) {
        event.preventDefault();
        onOpen(results[focusedIndex]);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [focusedIndex, isEnabled, onOpen, results, setFocusedIndex, suggestionsOpen]);

  useEffect(() => {
    const node = cardRefs.current[focusedIndex];
    node?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [focusedIndex]);

  const setCardRef = (index: number) => (node: HTMLElement | null) => {
    cardRefs.current[index] = node;
  };

  return { setCardRef };
};
