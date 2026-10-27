# DS3 Sprint Board for Claude — changelog

Versions of the Claude Desktop extension (`ds3-sprint-board-<version>.mcpb`). The hosted
connector (`https://ds3-sprint-board-mcp.ds3ucsd.workers.dev/mcp`) runs the same tools and is
updated with `npm run mcp:deploy`.

To release: bump `version` in `mcpb/manifest.json`, add an entry at the top, run
`npm run mcp:bundle`, and share the new file. Use [semver](https://semver.org): patch for fixes,
minor for new tools or options, major when something people rely on changes or goes away.

<!--
## x.y.z — YYYY-MM-DD

### Added
### Changed
### Fixed
-->

## 1.0.0 — 2026-10-27

First release.

- Sign in with your members-portal email and password; Claude acts as you, with the same
  Board / Executive permissions as members.ds3atucsd.com/sprints.
- 12 tools: `whoami`, `board_summary`, `list_sprints`, `list_teams`, `list_members`,
  `list_tasks`, `get_task`, `create_task`, `update_task`, `move_task`, `review_task`,
  `delete_task`.
- Same rules as the website: descriptions of at least 20 characters, at most 5 expected hours
  per task, actual hours before review, only the assigned reviewer approves. Creating a task
  emails its assignees; moving one to pending review emails the reviewer.
