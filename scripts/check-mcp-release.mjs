/**
 * Release check for the sprint board MCP (mcp/sprint-board/). Run by CI on pull requests and
 * by hand with `npm run mcp:check [base-ref]` (default origin/main).
 *
 * If anything that ships changed since the base, the PR must:
 *   1. bump `version` in mcp/sprint-board/mcpb/manifest.json above the base's (semver),
 *   2. keep SERVER_INFO.version in mcp/sprint-board/tools.ts equal to it,
 *   3. add a `## <version> — YYYY-MM-DD` entry to mcp/sprint-board/CHANGELOG.md.
 * Changes to the changelog alone don't need a bump.
 */
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MCP_DIR = "mcp/sprint-board/";
const MANIFEST = `${MCP_DIR}mcpb/manifest.json`;
const TOOLS = `${MCP_DIR}tools.ts`;
const CHANGELOG = `${MCP_DIR}CHANGELOG.md`;
const base = process.argv[2] || process.env.BASE_REF || "origin/main";

const git = (...args) =>
  execFileSync("git", args, {
    cwd: REPO_ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
const showAtBase = file => {
  try {
    return git("show", `${base}:${file}`);
  } catch {
    return null; // file is new on this branch
  }
};
const read = file => fs.readFileSync(path.join(REPO_ROOT, file), "utf8");

const parse = v => {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(v ?? "");
  return m ? m.slice(1).map(Number) : null;
};
const greater = (a, b) => {
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] > b[i];
  return false;
};

const mergeBase = git("merge-base", base, "HEAD");
const changed = git("diff", "--name-only", mergeBase, "--", MCP_DIR)
  .split("\n")
  .filter(file => file && file !== CHANGELOG);

if (changed.length === 0) {
  console.log(`No sprint board MCP changes since ${base}.`);
  process.exit(0);
}

const errors = [];
const version = JSON.parse(read(MANIFEST)).version;
const current = parse(version);
if (!current) errors.push(`${MANIFEST}: version "${version}" is not x.y.z.`);

const baseManifest = showAtBase(MANIFEST);
const baseVersion = baseManifest ? JSON.parse(baseManifest).version : null;
if (current && baseVersion && !greater(current, parse(baseVersion))) {
  errors.push(`${MANIFEST}: bump version above ${baseVersion} (now ${version}).`);
}

const serverVersion = /SERVER_INFO\s*=\s*\{[^}]*version:\s*"([^"]+)"/.exec(read(TOOLS))?.[1];
if (serverVersion !== version) {
  errors.push(`${TOOLS}: SERVER_INFO.version is "${serverVersion}", must equal ${version}.`);
}

const heading = new RegExp(`^## ${version.replace(/\./g, "\\.")} — \\d{4}-\\d{2}-\\d{2}$`, "m");
if (!heading.test(read(CHANGELOG))) {
  errors.push(`${CHANGELOG}: add a "## ${version} — YYYY-MM-DD" entry describing the change.`);
}

console.log(`Sprint board MCP files changed since ${base}:\n  ${changed.join("\n  ")}`);
if (errors.length > 0) {
  console.error(`\nRelease check failed:\n  - ${errors.join("\n  - ")}`);
  console.error("\nSee AGENTS.md → Sprint board MCP releases.");
  process.exit(1);
}
console.log(`\nRelease check passed: ${baseVersion ?? "(new)"} → ${version}.`);
