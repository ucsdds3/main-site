import { useCallback, useState } from "react";

import type { SavedCandidateSnapshot, TalentLensCandidateResult } from "../types";
import {
  getCandidateStorageId,
  loadSavedCandidates,
  persistSavedCandidates,
} from "../storage";

export const useSavedCandidates = () => {
  const [saved, setSaved] = useState<SavedCandidateSnapshot[]>(() => loadSavedCandidates());

  const isSaved = useCallback(
    (candidate: TalentLensCandidateResult) =>
      saved.some(item => item.candidate_id === getCandidateStorageId(candidate)),
    [saved]
  );

  const toggleSaved = useCallback((candidate: TalentLensCandidateResult) => {
    const candidateId = getCandidateStorageId(candidate);
    const exists = saved.some(item => item.candidate_id === candidateId);
    const next = exists
      ? saved.filter(item => item.candidate_id !== candidateId)
      : [{ candidate_id: candidateId, savedAt: Date.now(), candidate }, ...saved];
    persistSavedCandidates(next);
    setSaved(next);
    return !exists;
  }, [saved]);

  const unsave = useCallback((candidateId: string) => {
    const next = saved.filter(item => item.candidate_id !== candidateId);
    persistSavedCandidates(next);
    setSaved(next);
  }, [saved]);

  const clearAll = useCallback(() => {
    persistSavedCandidates([]);
    setSaved([]);
  }, []);

  const findSaved = useCallback(
    (candidateId: string) => saved.find(item => item.candidate_id === candidateId)?.candidate,
    [saved]
  );

  return { saved, isSaved, toggleSaved, unsave, clearAll, findSaved };
};
