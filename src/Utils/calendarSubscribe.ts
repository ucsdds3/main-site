/**
 * Public ICS feed URL for calendar subscribe (Supabase Edge Function `events-ics`).
 * Calendar apps poll this endpoint; it is not a Google Calendar API call.
 */
export function getEventsIcsFeedUrl(): string {
  const base = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";
  if (!base) return "";
  return `${base}/functions/v1/events-ics`;
}

/**
 * Google Calendar settings page where users paste an ICS URL.
 * Note: `calendar/r?cid=` only works for Google-hosted calendars, not arbitrary ICS feeds.
 */
export function getGoogleCalendarAddByUrlPage(): string {
  return "https://calendar.google.com/calendar/u/0/r/settings/addbyurl";
}

/** Apple / Outlook style subscribe scheme (same host, webcal instead of https). */
export function getWebcalSubscribeUrl(icsUrl: string = getEventsIcsFeedUrl()): string {
  if (!icsUrl.startsWith("https://")) return icsUrl;
  return `webcal://${icsUrl.slice("https://".length)}`;
}
