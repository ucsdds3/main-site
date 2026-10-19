# Sprint board MCP server

`mcp/sprint-board/` is an [MCP](https://modelcontextprotocol.io) server for the members-portal
sprint board (`/sprints`). Connect it to Claude Code and you can review the board, add tasks,
assign people and approve reviews by asking in plain English instead of clicking through the UI.

It runs locally over stdio and signs in to Supabase **as you**, with the same public anon key the
website uses and your members-portal password. Every read and write goes through the sprints
RLS policies, so you can do exactly what you can do on members.ds3atucsd.com/sprints and
nothing more. No service-role key is involved.

## Setup

1. Install dependencies in `main-site/`:

   ```sh
   npm install
   ```

2. Add your login to `main-site/.env`, which is gitignored and already holds the Vite Supabase
   keys:

   ```sh
   VITE_SUPABASE_URL=...            # already there for `npm run dev`
   VITE_SUPABASE_ANON_KEY=...       # already there for `npm run dev`
   SPRINTS_MCP_EMAIL=you@ucsd.edu   # your members-portal login (Board or Executive)
   SPRINTS_MCP_PASSWORD=...
   ```

   `.env.local` overrides `.env`, as it does for Vite. While `npm run db:local` is running, the
   server therefore talks to the local Supabase (log in as `exec@ucsd.edu` / `LocalDev1`).
   Variables already set in the server's environment take precedence over both files.

3. Connect it to Claude Code. Pick one:

   - **Inside this repo:** the committed `.mcp.json` registers it as `ds3-sprints`. Start
     `claude` from `main-site/` and approve the server when prompted.
   - **From any directory:** register it once at user scope, using absolute paths:

     ```sh
     claude mcp add --scope user ds3-sprints -- \
       /path/to/main-site/node_modules/.bin/tsx /path/to/main-site/mcp/sprint-board/server.ts
     ```

     The server still reads `main-site/.env`. You can pass `-e SPRINTS_MCP_EMAIL=...` and
     `-e SPRINTS_MCP_PASSWORD=...` instead.

4. Check it: run `/mcp` in Claude Code (it should list `ds3-sprints` as connected), then ask
   "who am I on the sprint board?"

To try it without Claude Code, run `npx @modelcontextprotocol/inspector npm run --silent mcp:sprints`.

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
| `delete_task` | Delete a card. Claude Code asks before running it |

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
- Board can't create or close sprints (Executive only, as on the site). This server does not
  manage sprints; use the website for that.

Emails go through the `notify-sprint-task` Edge Function, as they do from the website. If the
email fails, the card is still saved and the tool returns a warning.

## Example prompts

- "Summarize the active sprint. Who's overloaded, and what's overdue?"
- "What's waiting on my review? Approve 42 with 'nice work'."
- "Add a Software task for Alex Kim: migrate the events page to the new calendar, 3 hours, due
  Friday, Priya reviews."
- "Give everyone on Marketing a 1-hour task to post the GBM flyer."
- "Move all of Jordan's unfinished tasks to the next sprint."
