// events-ics — public ICS feed of published DS3 events for calendar subscribe
//
// Deploy from main-site/:
//   npx supabase functions deploy events-ics --no-verify-jwt
//
// No secrets required beyond the project’s auto-injected SUPABASE_URL / keys.
// Calendar apps poll this URL; keep verify_jwt off so they can fetch without auth.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

type EventRow = {
  id: number;
  name: string;
  description: string | null;
  location: string | null;
  start: string;
  end: string | null;
  tags: string[] | null;
  updated_at: string | null;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function isDataHacksEvent(event: EventRow): boolean {
  const name = (event.name ?? "").toLowerCase();
  const desc = (event.description ?? "").toLowerCase();
  const tags = event.tags ?? [];
  if (name.includes("datahacks") || name.includes("data hacks") || name.includes("datahack")) {
    return true;
  }
  if (desc.includes("datahacks")) return true;
  if (tags.some(t => String(t).toLowerCase().includes("datahacks"))) return true;
  return false;
}

/** ICS text escaping (RFC 5545). */
function icsEscape(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function toIcsUtc(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let remaining = line;
  parts.push(remaining.slice(0, 75));
  remaining = remaining.slice(75);
  while (remaining.length > 0) {
    parts.push(` ${remaining.slice(0, 74)}`);
    remaining = remaining.slice(74);
  }
  return parts.join("\r\n");
}

function buildIcs(events: EventRow[]): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//DS3 UCSD//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:DS3 Events",
    "X-WR-CALDESC:Published Data Science Student Society events at UC San Diego",
    "X-WR-TIMEZONE:America/Los_Angeles",
  ];

  const stamp = toIcsUtc(new Date().toISOString());

  for (const event of events) {
    const dtStart = toIcsUtc(event.start);
    const dtEnd = toIcsUtc(event.end || event.start);
    if (!dtStart || !dtEnd) continue;

    const uid = `ds3-event-${event.id}@ds3atucsd.com`;
    const lastMod = toIcsUtc(event.updated_at || event.start) || stamp;

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${stamp}`);
    lines.push(`DTSTART:${dtStart}`);
    lines.push(`DTEND:${dtEnd}`);
    lines.push(`LAST-MODIFIED:${lastMod}`);
    lines.push(foldLine(`SUMMARY:${icsEscape(event.name || "DS3 Event")}`));
    if (event.description?.trim()) {
      lines.push(foldLine(`DESCRIPTION:${icsEscape(event.description.trim())}`));
    }
    if (event.location?.trim()) {
      lines.push(foldLine(`LOCATION:${icsEscape(event.location.trim())}`));
    }
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}

Deno.serve(async req => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { ...corsHeaders, Allow: "GET, HEAD, OPTIONS" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseKey =
    Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!supabaseUrl || !supabaseKey) {
    return new Response("Calendar feed misconfigured", {
      status: 500,
      headers: corsHeaders,
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from("Events")
    .select("id,name,description,location,start,end,tags,updated_at")
    .eq("deleted", false)
    .eq("workflow_status", "complete")
    .order("start", { ascending: true });

  if (error) {
    console.error("[events-ics]", error.message);
    return new Response("Failed to load events", {
      status: 500,
      headers: corsHeaders,
    });
  }

  const now = Date.now();
  const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;
  const rows = ((data as EventRow[] | null) ?? []).filter(e => {
    if (isDataHacksEvent(e)) return false;
    const endMs = new Date(e.end || e.start).getTime();
    if (Number.isNaN(endMs)) return false;
    // Upcoming + recent past so the feed is rarely empty (Google rejects bad/empty calendars).
    return endMs >= ninetyDaysAgo;
  });
  const body = buildIcs(rows);

  const headers = {
    ...corsHeaders,
    "Content-Type": "text/calendar; charset=utf-8",
    "Content-Disposition": 'inline; filename="ds3-events.ics"',
    // Allow calendar clients to revalidate periodically.
    "Cache-Control": "public, max-age=300",
  };

  if (req.method === "HEAD") {
    return new Response(null, { status: 200, headers });
  }

  return new Response(body, { status: 200, headers });
});
