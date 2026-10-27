# Sprint board MCP server

`mcp/sprint-board/` is an [MCP](https://modelcontextprotocol.io) server for the members-portal
sprint board (`/sprints`). Connect it to Claude and you can review the board, add tasks, assign
people and approve reviews by asking in plain English instead of clicking through the UI.

It runs three ways, with the same tools and rules:

| | Hosted (Cloudflare Worker) | Desktop extension (`.mcpb`) | Local (stdio) |
|---|---|---|---|
| Works in | Claude web, desktop and mobile (custom connector), Claude Code, other MCP clients | Claude Desktop | Claude Code, Claude Desktop |
| Setup per person | Add one URL and sign in with your DS3 account | Double-click the file, enter email + password | Clone this repo, `npm install`, password in `.env` |
| Code | `mcp/sprint-board/worker.ts` | `server.ts`, bundled by `scripts/build-mcpb.mjs` | `mcp/sprint-board/server.ts` |

Both act **as the signed-in member**: every query runs with that member's own Supabase session
and the public anon key, so the sprints RLS policies apply exactly as on members.ds3atucsd.com.
A regular Member can't connect; Board can't create sprints. No service-role key is involved.

```
mcp/sprint-board/
  board.ts       queries + validation (mirrors the /sprints UI)
  tools.ts       the MCP tools, shared by both servers
  worker.ts      hosted: OAuth sign-in + MCP over HTTP at /mcp
  server.ts      local: stdio, signs in from .env
  wrangler.jsonc Cloudflare config
  mcpb/          Claude Desktop extension manifest + icon
```

## Hosted

### Connect (everyone)

You need the Worker URL from whoever deployed it, e.g.
`https://ds3-sprint-board-mcp.<account>.workers.dev/mcp`.

- **Claude app (web, desktop, mobile):** Settings → Connectors → Add custom connector → paste
  the URL → Connect. A DS3 page opens: sign in with your members-portal email and password and
  click **Sign in and allow**. Custom connectors depend on your Claude plan; on Team/Enterprise an
  owner may have to add it for the org.
- **Claude Code:** `claude mcp add --transport http ds3-sprints <url>`, then run `/mcp` and
  choose `ds3-sprints` to sign in.

Your password is only used to sign in to Supabase on that page and is never stored. The Worker
keeps your Supabase session (encrypted in Workers KV) so Claude stays connected; an idle
connection signs in again after 30 days. Disconnecting the connector in Claude revokes it.

### Deploy (once, by an admin)

It runs on the free Cloudflare Workers plan. From `main-site/`:

1. Make a free Cloudflare account, then sign in from the terminal:

   ```sh
   npm install
   npx wrangler@4.149.0 login
   ```

2. Deploy. The first deploy creates the `OAUTH_KV` namespace automatically and prints the URL:

   ```sh
   npm run mcp:deploy
   ```

3. Give it the Supabase anon key, the same public value as `VITE_SUPABASE_ANON_KEY`:

   ```sh
   npx wrangler@4.149.0 secret put SUPABASE_ANON_KEY --config mcp/sprint-board/wrangler.jsonc
   ```

4. Open the printed URL: it should say "DS3 sprint board MCP server". Share `<url>/mcp`.

Merging to `main` does **not** redeploy the Worker. Run `npm run mcp:deploy` again after
changing anything in `mcp/sprint-board/`. Logs: Cloudflare dashboard → Workers → ds3-sprint-board-mcp.

`SUPABASE_URL` is set in `wrangler.jsonc` (the Membership project). To serve it on a custom
domain, add a route in Cloudflare and set the `PUBLIC_ORIGIN` var to that origin.

### Try it locally

```sh
npm run db:local                # local Supabase (see AGENTS.md)
npx wrangler@4.149.0 dev --config mcp/sprint-board/wrangler.jsonc \
  --var SUPABASE_URL:http://127.0.0.1:54321 --var SUPABASE_ANON_KEY:<anon key from .env.local>
```

Then point an MCP client at `http://127.0.0.1:8787/mcp` and sign in as `exec@ucsd.edu` /
`LocalDev1`, or run `npx @modelcontextprotocol/inspector`.

## Claude Desktop extension (.mcpb)

### Install (everyone)

1. Get `ds3-sprint-board.mcpb` from a Board member.
2. Double-click it (or drag it into Claude Desktop → Settings → Extensions) and click **Install**.
3. Enter your members-portal email and password. Claude stores the password as a sensitive
   setting; it is only sent to DS3's Supabase sign-in.
4. In a new chat: *"Using the DS3 sprint board, who am I?"*

Wrong password or not Board/Executive: the tools answer with the reason. Fix it under
Settings → Extensions → DS3 Sprint Board → Configure.

### Build

```sh
npm run mcp:bundle   # → dist-mcpb/ds3-sprint-board.mcpb (gitignored)
```

Bundles `server.ts` into one file, fills the Supabase URL + anon key into
`mcp/sprint-board/mcpb/manifest.json`, then validates and packs it with the `mcpb` CLI. The key
comes from `VITE_SUPABASE_ANON_KEY` (`.env` or the environment); the script refuses any key that
isn't the Membership **anon** key. Bump `version` in the manifest when you share a new build.

## Local

1. `npm install` in `main-site/`.
2. Add your login to `main-site/.env` (gitignored; it already holds the Vite Supabase keys):

   ```sh
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   SPRINTS_MCP_EMAIL=you@ucsd.edu   # your members-portal login (Board or Executive)
   SPRINTS_MCP_PASSWORD=...
   ```

   `.env.local` overrides `.env`, as it does for Vite. While `npm run db:local` is running, the
   server therefore talks to the local Supabase. Variables already set in the server's
   environment take precedence over both files.

3. Connect it:

   - **Claude Code, inside this repo:** the committed `.mcp.json` registers it as
     `ds3-sprints`. Start `claude` from `main-site/` and approve it.
   - **Claude Code, from any directory:**

     ```sh
     claude mcp add --scope user ds3-sprints -- \
       /path/to/main-site/node_modules/.bin/tsx /path/to/main-site/mcp/sprint-board/server.ts
     ```

   - **Claude Desktop:** Settings → Developer → Edit Config, then restart Desktop. Use full
     paths; `which node` prints node's:

     ```json
     {
       "mcpServers": {
         "ds3-sprints": {
           "command": "/full/path/to/node",
           "args": [
             "/full/path/to/main-site/node_modules/tsx/dist/cli.mjs",
             "/full/path/to/main-site/mcp/sprint-board/server.ts"
           ]
         }
       }
     }
     ```

To try it without Claude: `npx @modelcontextprotocol/inspector npm run --silent mcp:sprints`.

## Tools

| Tool | What it does |
|---|---|
| `whoami` | Your member id, name, Board/Executive level and teams |
| `list_sprints` | All sprints with status and dates |
| `list_teams` | Team keys a task can belong to (`BoardTeams`) |
| `list_members` | Board/Exec members you can assign or pick as reviewer, filterable by team or name |
| `board_summary` | One sprint at a glance: counts, hours, overdue, pending review, what is waiting on *your* review, per-person load, idle members |
| `list_tasks` | A sprint's cards (active by default, or `"all"`), filtered by team, status, assignee, reviewer, `mine`, or overdue |
| `get_task` | Full card: description, notes, URL, reviewer and review state |
| `create_task` | Add a card and assign it (or one card per member of a team). Emails the assignees |
| `update_task` | Edit fields, replace/add/remove assignees, change the reviewer, move between sprints |
| `move_task` | Change column, optionally logging actual hours. Moving to pending review emails the reviewer |
| `review_task` | As the reviewer: approve (moves to Complete) or send back to In progress |
| `delete_task` | Delete a card. Clients ask before running it |

People can be named by email, member id, full or partial name, or `"me"`. If a name matches more
than one person, the tool refuses and lists the matches. Sprints can be `"active"`, `"planning"`,
an id, or a name.

## Rules it enforces

These match the task modal and `useSprintBoard.ts`, and the database triggers and RLS back them up:

- Title is required, the description is at least 20 characters, and expected hours are 0–5.
- Every card has at least one assignee and one sprint. Closed sprints accept no new cards.
- Pending review and Complete need actual hours. Pending review needs a reviewer.
- A card with a reviewer reaches Complete only through that reviewer's approval
  (`review_task`). A card without a reviewer can go straight to Complete.
- Progress notes are capped at 100 words.
- Creating and closing sprints stays on the website (Executive only).

Emails go through the `notify-sprint-task` Edge Function, as they do from the website. If the
email fails, the card is still saved and the tool returns a warning.

## Example prompts

- "Summarize the active sprint. Who's overloaded, and what's overdue?"
- "What's waiting on my review? Approve 42 with 'nice work'."
- "Add a Software task for Alex Kim: migrate the events page to the new calendar, 3 hours, due
  Friday, Priya reviews."
- "Give everyone on Marketing a 1-hour task to post the GBM flyer."
- "Move all of Jordan's unfinished tasks to the next sprint."
