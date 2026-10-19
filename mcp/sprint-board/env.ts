import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

/**
 * Fill process.env from the repo's dotenv files. Anything already set in the
 * environment (e.g. from Claude Code's MCP config) wins, then `.env.local`, then `.env`
 * — the same precedence Vite uses.
 */
export function loadRepoEnv(files = [".env.local", ".env"]): void {
  for (const name of files) {
    const path = resolve(REPO_ROOT, name);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
      if (!match) continue;
      const [, key, raw] = match;
      if (process.env[key] !== undefined) continue;
      process.env[key] = raw.replace(/^(['"])(.*)\1$/, "$2");
    }
  }
}

export type SprintMcpConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  email: string;
  password: string;
};

export function readConfig(): SprintMcpConfig {
  loadRepoEnv();
  const config = {
    supabaseUrl: process.env.SPRINTS_MCP_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "",
    supabaseAnonKey:
      process.env.SPRINTS_MCP_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "",
    email: (process.env.SPRINTS_MCP_EMAIL || "").trim().toLowerCase(),
    password: process.env.SPRINTS_MCP_PASSWORD || "",
  };
  const missing = [
    !config.supabaseUrl && "VITE_SUPABASE_URL",
    !config.supabaseAnonKey && "VITE_SUPABASE_ANON_KEY",
    !config.email && "SPRINTS_MCP_EMAIL",
    !config.password && "SPRINTS_MCP_PASSWORD",
  ].filter(Boolean);
  if (missing.length > 0) {
    throw new Error(
      `Sprint board MCP is not configured: set ${missing.join(", ")} in main-site/.env ` +
        "or in the MCP server's env (see docs/SPRINT_BOARD_MCP.md)."
    );
  }
  return config;
}
