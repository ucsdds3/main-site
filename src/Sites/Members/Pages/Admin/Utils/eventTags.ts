/** Preset tags shown in admin; custom tags can be added per event. */
export const DEFAULT_EVENT_TAGS = [
  "Workshop",
  "Professional",
  "Social",
  "Fundraiser",
  "Other",
] as const;

export function normalizeEventTag(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

/** Preset labels plus any selected custom tags (stable order). */
export function eventTagOptionsForForm(selectedTags: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const tag of [...DEFAULT_EVENT_TAGS, ...selectedTags]) {
    const normalized = normalizeEventTag(tag);
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(normalized);
  }
  return out;
}
