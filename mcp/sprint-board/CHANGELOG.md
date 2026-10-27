# DS3 Sprint Board for Claude — changelog

Versions of the Claude Desktop extension (`ds3-sprint-board-<version>.mcpb`). The hosted
connector (`https://ds3-sprint-board-mcp.ds3ucsd.workers.dev/mcp`) runs the same tools and is
updated with `npm run mcp:deploy`.

**Every change under `mcp/sprint-board/` is a release.** Follow AGENTS.md → *Sprint board MCP
releases*: bump `version` in `mcpb/manifest.json` and `SERVER_INFO.version` in `tools.ts` to the
same [semver](https://semver.org) value (patch = fix, minor = new tool/option, major = breaking),
add an entry at the top of this file, pass `npm run mcp:check`, then after merge run
`npm run mcp:deploy` and `npm run mcp:bundle` and share the new `.mcpb`.

<!--
## x.y.z — YYYY-MM-DD

### Added
### Changed
### Fixed
-->

## 1.1.0 — 2026-10-27

First release.

- Sign in with your members-portal email and password; Claude acts as you, with the same
  Board / Executive permissions as members.ds3atucsd.com/sprints.
- 12 tools: `whoami`, `board_summary`, `list_sprints`, `list_teams`, `list_members`,
  `list_tasks`, `get_task`, `create_task`, `update_task`, `move_task`, `review_task`,
  `delete_task`.
- Same rules as the website: descriptions of at least 20 characters, at most 5 expected hours
  per task, actual hours before review, only the assigned reviewer approves. Creating a task
  emails its assignees; moving one to pending review emails the reviewer.
