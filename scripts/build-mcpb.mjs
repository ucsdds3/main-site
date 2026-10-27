/**
 * Build the DS3 sprint board as a Claude Desktop extension: dist-mcpb/ds3-sprint-board-<version>.mcpb.
 *
 * Bundles mcp/sprint-board/server.ts (and its deps) into one server/index.js, fills the
 * public Supabase URL + anon key into the manifest, and packs it with the mcpb CLI. Members
 * double-click the .mcpb in Claude Desktop and enter their portal email + password.
 *
 * The anon key comes from SPRINTS_MCP_SUPABASE_ANON_KEY / VITE_SUPABASE_ANON_KEY (env, then
 * .env.local, then .env). Never a service-role key: the server signs in as the member.
 */
import { execFileSync } from "child_process";
import { build } from "esbuild";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(REPO_ROOT, "mcp/sprint-board");
const OUT = path.join(REPO_ROOT, "dist-mcpb");
const STAGE = path.join(OUT, "ds3-sprint-board");
const PROJECT_REF = "aogowlvmcvvrnryxuzlr";

function readEnvFile(name) {
  const file = path.join(REPO_ROOT, name);
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
    if (match) out[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
  }
  return out;
}

const env = { ...readEnvFile(".env"), ...readEnvFile(".env.local"), ...process.env };
const supabaseUrl =
  env.SPRINTS_MCP_SUPABASE_URL || env.VITE_SUPABASE_URL || `https://${PROJECT_REF}.supabase.co`;
const anonKey = env.SPRINTS_MCP_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || "";

// Refuse anything but the Membership anon key, so a service-role key can't ship by mistake.
function jwtPayload(token) {
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
  } catch {
    return null;
  }
}
const claims = jwtPayload(anonKey);
if (!claims) {
  console.error("Set VITE_SUPABASE_ANON_KEY (in .env or the environment) to build the bundle.");
  process.exit(1);
}
if (claims.role !== "anon" || claims.ref !== PROJECT_REF) {
  console.error(`Refusing to bundle a key with role=${claims.role} ref=${claims.ref}.`);
  process.exit(1);
}
if (new URL(supabaseUrl).hostname !== `${PROJECT_REF}.supabase.co`) {
  console.error(`Unexpected Supabase URL ${supabaseUrl}.`);
  process.exit(1);
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(STAGE, "server"), { recursive: true });

await build({
  entryPoints: [path.join(SRC, "server.ts")],
  outfile: path.join(STAGE, "server/index.js"),
  bundle: true,
  platform: "node",
  target: "node18",
  format: "esm",
  minify: true,
  legalComments: "none",
  // Some bundled CommonJS deps call require(); give the ESM bundle one.
  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  },
  logLevel: "warning",
});
fs.writeFileSync(path.join(STAGE, "package.json"), JSON.stringify({ type: "module" }, null, 2));

const manifest = fs
  .readFileSync(path.join(SRC, "mcpb/manifest.json"), "utf8")
  .replace("__SUPABASE_URL__", supabaseUrl)
  .replace("__SUPABASE_ANON_KEY__", anonKey);
fs.writeFileSync(path.join(STAGE, "manifest.json"), manifest);
fs.copyFileSync(path.join(SRC, "mcpb/icon.png"), path.join(STAGE, "icon.png"));

// The file name carries the version so shared builds are easy to tell apart. Bump it in the
// manifest and add a CHANGELOG.md entry for every build you send out.
const { version } = JSON.parse(manifest);
const mcpb = ["--yes", "@anthropic-ai/mcpb@2.1.2"];
const bundle = path.join(OUT, `ds3-sprint-board-${version}.mcpb`);
// npx is a .cmd shim on Windows, which execFileSync can only run through a shell.
const npx = { stdio: "inherit", shell: process.platform === "win32" };
execFileSync("npx", [...mcpb, "validate", path.join(STAGE, "manifest.json")], npx);
execFileSync("npx", [...mcpb, "pack", STAGE, bundle], npx);
console.log(`\nBuilt ${path.relative(REPO_ROOT, bundle)}`);
