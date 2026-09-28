import { useEffect, useMemo, useState } from "react";

import Page from "src/Shared/Page/Page";
import { supabase } from "src/Utils/supabase";
import { teamKeyToLabel } from "src/Sites/Main/Pages/Board/boardTeamConfig";
import type { BoardTeamCatalogEntry } from "src/Sites/Main/Pages/Board/boardTeamTypes";
import { useBoardTeamsCatalog } from "src/Sites/Main/Pages/Board/useBoardTeamsCatalog";
import { teamAccent } from "src/Sites/Members/Pages/Sprints/constants";

import OpeningRow from "./Components/OpeningRow";
import Landing from "./Sections/Landing";
import type { ApplicationOpening } from "./types";

/** Visible from opens_at through the due instant; hidden the moment the deadline passes. */
function isCurrentlyOpen(row: ApplicationOpening, nowMs: number): boolean {
  const opens = new Date(row.opens_at).getTime();
  const due = new Date(row.due_at).getTime();
  if (Number.isNaN(opens) || Number.isNaN(due)) return false;
  return opens <= nowMs && due > nowMs;
}

function nextWindowChangeMs(rows: ApplicationOpening[], nowMs: number): number | null {
  let soonest: number | null = null;
  for (const row of rows) {
    const opens = new Date(row.opens_at).getTime();
    const due = new Date(row.due_at).getTime();
    for (const t of [opens, due]) {
      if (Number.isNaN(t) || t <= nowMs) continue;
      if (soonest == null || t < soonest) soonest = t;
    }
  }
  return soonest;
}

type TeamGroup = {
  teamKey: string;
  label: string;
  openings: ApplicationOpening[];
};

function groupByTeam(
  openings: ApplicationOpening[],
  catalog: BoardTeamCatalogEntry[]
): TeamGroup[] {
  const order = new Map(catalog.map((t, i) => [t.team_key, t.sort_order * 1000 + i]));
  const byTeam = new Map<string, ApplicationOpening[]>();
  for (const opening of openings) {
    const key = opening.team_key.trim() || "UNASSIGNED";
    const list = byTeam.get(key);
    if (list) list.push(opening);
    else byTeam.set(key, [opening]);
  }

  return [...byTeam.entries()]
    .sort(([a], [b]) => {
      const ai = order.get(a) ?? Number.POSITIVE_INFINITY;
      const bi = order.get(b) ?? Number.POSITIVE_INFINITY;
      if (ai !== bi) return ai - bi;
      return teamKeyToLabel(a, catalog).localeCompare(teamKeyToLabel(b, catalog));
    })
    .map(([teamKey, teamOpenings]) => ({
      teamKey,
      label: teamKeyToLabel(teamKey, catalog),
      openings: teamOpenings,
    }));
}

export default function Apply() {
  const { catalog } = useBoardTeamsCatalog();
  const [rows, setRows] = useState<ApplicationOpening[]>([]);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const { data, error } = await supabase
        .from("Applications")
        .select(
          "id, title, team_key, description, preferred_experience, application_url, poster_emails, opens_at, due_at"
        )
        .eq("deleted", false)
        .gt("due_at", new Date().toISOString())
        .order("due_at", { ascending: true });

      if (cancelled) return;

      if (error || !data) {
        setRows([]);
        setLoading(false);
        return;
      }

      setRows(data as ApplicationOpening[]);
      setNowMs(Date.now());
      setLoading(false);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const next = nextWindowChangeMs(rows, nowMs);
    if (next == null) return;
    const delay = Math.min(Math.max(next - Date.now(), 0) + 50, 60_000);
    const id = window.setTimeout(() => setNowMs(Date.now()), delay);
    return () => window.clearTimeout(id);
  }, [rows, nowMs]);

  const openings = useMemo(() => rows.filter(row => isCurrentlyOpen(row, nowMs)), [rows, nowMs]);
  const groups = useMemo(() => groupByTeam(openings, catalog), [openings, catalog]);

  return (
    <Page>
      <Landing />
      <div className="mx-auto flex w-full max-w-[1300px] flex-col gap-[clamp(2rem,4vw,3.5rem)] px-[clamp(1.25rem,4vw,3rem)] py-[clamp(2.5rem,5vw,5rem)]">
        {loading ? (
          <p className="m-0 text-(--obs-text-muted)">Loading openings…</p>
        ) : openings.length === 0 ? (
          <div className="max-w-2xl">
            <h2 className="mt-0 mb-3 text-fluid-section-title text-(--obs-text-primary)">
              No openings right now
            </h2>
            <p className="m-0 text-base leading-7 text-(--obs-text-muted)">
              Board leadership positions often open in fall at our GBM. Projects, Consulting, and
              Open Source applications open quarterly in week 1. Hackathon applications open
              throughout the year.
            </p>
          </div>
        ) : (
          groups.map(group => (
            <section key={group.teamKey} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="h-0.5 w-[28px] shrink-0 rounded-sm"
                  style={{ background: teamAccent(group.teamKey) }}
                />
                <h2 className="m-0 text-xl tracking-tight text-(--obs-text-primary) sm:text-2xl">
                  {group.label}
                </h2>
              </div>
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {group.openings.map(opening => (
                  <OpeningRow key={opening.id} opening={opening} />
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </Page>
  );
}
