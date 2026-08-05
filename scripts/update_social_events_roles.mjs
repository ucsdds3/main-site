#!/usr/bin/env node
/**
 * Update Social Events board roles on Members.teams:
 *   - Yagnasri → "Social Events Director"
 *   - Hannah   → "Social Events"
 *   - Shourya  → "Social Events"
 *
 * Dry-run by default (logs intended changes only). Pass --apply to write.
 *
 * Env (loaded from repo-root .env / .env.local):
 *   VITE_SUPABASE_URL or SUPABASE_URL
 *   For --apply: SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_SECRET_API_KEY (RLS bypass)
 *   For dry-run: VITE_SUPABASE_ANON_KEY is enough if Members select is allowed
 *
 * Usage:
 *   node scripts/update_social_events_roles.mjs
 *   node scripts/update_social_events_roles.mjs --apply
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TEAM_KEY = "SOCIAL_EVENTS";
const APPLY = process.argv.includes("--apply");

/** @type {{ match: RegExp, role: string }[]} */
const UPDATES = [
  { match: /^yagnasri\b/i, role: "Social Events Director" },
  { match: /^hannah\b/i, role: "Social Events" },
  { match: /^shourya\b/i, role: "Social Events" },
];

function loadEnvFiles() {
  for (const name of [".env.local", ".env"]) {
    const path = resolve(REPO_ROOT, name);
    if (!existsSync(path)) continue;
    const text = readFileSync(path, "utf8");
    for (const raw of text.split(/\r?\n/)) {
      let line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      if (line.toLowerCase().startsWith("export ")) line = line.slice(7).trim();
      const eq = line.indexOf("=");
      if (eq < 0) continue;
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!key) continue;
      if (process.env[key] && String(process.env[key]).trim()) continue;
      process.env[key] = val;
    }
  }
}

function labelToTeamKey(label) {
  return String(label).trim().replace(/\s+/g, "_").toUpperCase();
}

/** Normalize teams object keys; prefer SOCIAL_EVENTS storage key. */
function normalizeTeams(raw) {
  if (raw == null) return {};
  let obj = raw;
  if (typeof raw === "string") {
    try {
      obj = JSON.parse(raw);
    } catch {
      return {};
    }
  }
  if (typeof obj !== "object" || Array.isArray(obj)) return {};
  /** @type {Record<string, string>} */
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string" && v.trim()) out[k] = v.trim();
  }
  return out;
}

function hasSocialEvents(teams) {
  return Object.keys(teams).some(k => labelToTeamKey(k) === TEAM_KEY);
}

function socialEventsRole(teams) {
  if (typeof teams[TEAM_KEY] === "string") return teams[TEAM_KEY];
  for (const [k, v] of Object.entries(teams)) {
    if (labelToTeamKey(k) === TEAM_KEY) return v;
  }
  return undefined;
}

/** Build next teams map: drop legacy Social Events keys, set SOCIAL_EVENTS role. */
function withSocialRole(teams, role) {
  /** @type {Record<string, string>} */
  const next = {};
  for (const [k, v] of Object.entries(teams)) {
    if (labelToTeamKey(k) === TEAM_KEY) continue;
    next[k] = v;
  }
  next[TEAM_KEY] = role;
  return next;
}

function matchUpdate(fullName) {
  const name = String(fullName || "").trim();
  return UPDATES.find(u => u.match.test(name)) ?? null;
}

async function main() {
  loadEnvFiles();

  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim();
  const serviceKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_SECRET_API_KEY ||
    ""
  ).trim();
  const anonKey = (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "").trim();

  const key = APPLY ? serviceKey || anonKey : anonKey || serviceKey;
  if (!url || !key) {
    console.error("Missing Supabase URL or API key in env.");
    process.exit(1);
  }

  if (APPLY && !serviceKey) {
    console.warn(
      "WARNING: --apply without service role key; update may fail under RLS. Set SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const supabase = createClient(url, key);
  console.log(APPLY ? "MODE: APPLY (will write)" : "MODE: DRY-RUN (no writes)");

  const { data, error } = await supabase
    .from("Members")
    .select("id, full_name, email, teams, deleted")
    .neq("teams", null)
    .or("deleted.is.null,deleted.eq.false");

  if (error) {
    console.error("Fetch error:", error.message);
    process.exit(1);
  }

  const social = (data ?? []).filter(row => hasSocialEvents(normalizeTeams(row.teams)));
  console.log(`\nSocial Events members found: ${social.length}`);
  for (const row of social) {
    const teams = normalizeTeams(row.teams);
    console.log(`  - ${row.full_name} | role=${socialEventsRole(teams) ?? "(none)"} | id=${row.id}`);
  }

  /** @type {{ id: string, name: string, email: string|null, from: string|undefined, to: string, nextTeams: Record<string,string> }[]} */
  const planned = [];
  const matchedNames = new Set();

  for (const row of data ?? []) {
    const teams = normalizeTeams(row.teams);
    if (!hasSocialEvents(teams)) continue;
    const upd = matchUpdate(row.full_name);
    if (!upd) continue;
    matchedNames.add(upd.match.source);
    const from = socialEventsRole(teams);
    if (from === upd.role && Object.prototype.hasOwnProperty.call(teams, TEAM_KEY)) {
      console.log(`\nSKIP (already correct): ${row.full_name} → ${upd.role}`);
      continue;
    }
    planned.push({
      id: row.id,
      name: row.full_name,
      email: row.email,
      from,
      to: upd.role,
      nextTeams: withSocialRole(teams, upd.role),
    });
  }

  console.log("\n--- Planned updates ---");
  if (planned.length === 0) {
    console.log("(none)");
  } else {
    for (const p of planned) {
      console.log(`${p.name} (${p.email ?? "no email"}) id=${p.id}`);
      console.log(`  ${JSON.stringify(p.from)} → ${JSON.stringify(p.to)}`);
      console.log(`  teams: ${JSON.stringify(p.nextTeams)}`);
    }
  }

  for (const u of UPDATES) {
    const found = (data ?? []).some(row => {
      const teams = normalizeTeams(row.teams);
      return hasSocialEvents(teams) && u.match.test(String(row.full_name || "").trim());
    });
    if (!found) {
      console.warn(`\nWARNING: no Social Events member matched /${u.match.source}/`);
    }
  }

  if (!APPLY) {
    console.log("\nDry-run complete. Re-run with --apply to write.");
    return;
  }

  let ok = 0;
  let fail = 0;
  for (const p of planned) {
    const { data: updated, error: updErr } = await supabase
      .from("Members")
      .update({ teams: p.nextTeams })
      .eq("id", p.id)
      .select("id, teams");
    if (updErr) {
      fail += 1;
      console.error(`FAILED ${p.name}: ${updErr.message}`);
    } else if (!updated || updated.length === 0) {
      fail += 1;
      console.error(
        `FAILED ${p.name}: update returned 0 rows (likely RLS blocked write). Set SUPABASE_SERVICE_ROLE_KEY.`
      );
    } else {
      ok += 1;
      console.log(`UPDATED ${p.name}: ${JSON.stringify(updated[0].teams)}`);
    }
  }
  console.log(`\nDone. updated=${ok} failed=${fail}`);
  if (fail > 0) process.exitCode = 1;
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
