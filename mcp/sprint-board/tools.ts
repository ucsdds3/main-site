import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  brief,
  detail,
  MAX_EXPECTED_HOURS,
  MAX_PROGRESS_NOTES_WORDS,
  MIN_TASK_DESCRIPTION_LENGTH,
  type SprintBoard,
  TASK_STATUSES,
} from "./board";

// Tool definitions shared by the local stdio server (server.ts) and the hosted Worker (worker.ts).

export const SERVER_INFO = { name: "ds3-sprint-board", version: "1.0.0" };

export const INSTRUCTIONS = [
  "DS3 club-wide sprint board (members.ds3atucsd.com/sprints). Board and Executive only.",
  "Columns: todo → in_progress → pending_review → done. cancelled means dropped.",
  `Tasks need a description of at least ${MIN_TASK_DESCRIPTION_LENGTH} characters and at most ${MAX_EXPECTED_HOURS} expected hours (split bigger work).`,
  "Moving to pending_review or done needs actual_hours. pending_review needs a reviewer; with a reviewer, only that reviewer can approve (review_task).",
  "People are matched by email, id, or name; if a name is ambiguous, ask the user which person they mean.",
  "Creating a task emails its assignees and moving one to pending_review emails the reviewer, like the website does.",
].join("\n");

type ToolResult = { content: { type: "text"; text: string }[]; isError?: boolean };

async function run(
  connect: () => Promise<SprintBoard>,
  fn: (board: SprintBoard) => Promise<unknown>
): Promise<ToolResult> {
  try {
    const result = await fn(await connect());
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { content: [{ type: "text", text: message }], isError: true };
  }
}

const personRef = z
  .union([z.number().int(), z.string().min(1)])
  .describe('A Board/Exec member: "me", a member id, an email, or a name (partial is fine).');
const sprintRef = z
  .union([z.number().int(), z.string().min(1)])
  .describe('"active" (default), "planning" (the next sprint), "all", a sprint id, or its name.');
const taskId = z.number().int().describe("Task id (from list_tasks).");
const status = z.enum(TASK_STATUSES);

/** Register every sprint board tool. `connect` yields the signed-in member's board. */
export function registerTools(server: McpServer, connect: () => Promise<SprintBoard>): void {
  const readOnly = { readOnlyHint: true, openWorldHint: false } as const;

  server.registerTool(
    "whoami",
    {
      title: "Who am I",
      description: "The signed-in member: id, name, Board/Executive level, teams.",
      annotations: readOnly,
    },
    () => run(connect, board => board.whoami())
  );

  server.registerTool(
    "list_sprints",
    {
      title: "List sprints",
      description: "All sprints, newest first, with status (planning / active / closed) and dates.",
      annotations: readOnly,
    },
    () => run(connect, board => board.listSprints())
  );

  server.registerTool(
    "list_teams",
    {
      title: "List teams",
      description: "Board committees a task can belong to (team_key + label).",
      annotations: readOnly,
    },
    () => run(connect, board => board.listTeams())
  );

  server.registerTool(
    "list_members",
    {
      title: "List assignable members",
      description:
        "Board and Executive members who can be assigned tasks or review them, with their teams.",
      inputSchema: {
        team: z.string().optional().describe("Only members on this team (key or label)."),
        query: z.string().optional().describe("Case-insensitive match on name or email."),
      },
      annotations: readOnly,
    },
    ({ team, query }) =>
      run(connect, async board => {
        let members = await board.listMembers();
        if (team) {
          const key = await board.resolveTeam(team);
          members = members.filter(m => m.team_keys.includes(key));
        }
        if (query) {
          const needle = query.toLowerCase();
          members = members.filter(
            m =>
              m.full_name.toLowerCase().includes(needle) || m.email.toLowerCase().includes(needle)
          );
        }
        return members;
      })
  );

  server.registerTool(
    "board_summary",
    {
      title: "Sprint summary",
      description:
        "Review a sprint at a glance: counts by status, hours, overdue cards, cards in pending review, " +
        "what is waiting on your review, each person's load, and Board members with nothing assigned.",
      inputSchema: { sprint: sprintRef.optional() },
      annotations: readOnly,
    },
    ({ sprint }) => run(connect, board => board.summary(sprint))
  );

  server.registerTool(
    "list_tasks",
    {
      title: "List tasks",
      description:
        "Cards on a sprint (the active one by default), with optional filters. Dropped cards are " +
        "hidden unless include_dropped is set or status includes cancelled.",
      inputSchema: {
        sprint: sprintRef.optional(),
        team: z.string().optional().describe("Team key or label, e.g. SOFTWARE or Social Events."),
        status: z.array(status).optional().describe("Only these statuses."),
        assignee: personRef.optional(),
        reviewer: personRef.optional(),
        mine: z
          .boolean()
          .optional()
          .describe("Only cards assigned to me or waiting on my review (the board's Mine tab)."),
        overdue_only: z.boolean().optional(),
        include_dropped: z.boolean().optional(),
      },
      annotations: readOnly,
    },
    ({ sprint, team, status: statuses, assignee, reviewer, mine, overdue_only, include_dropped }) =>
      run(connect, async board => {
        const result = await board.listTasks(sprint, {
          team,
          statuses,
          assignee,
          reviewer,
          mine,
          overdue_only,
          include_dropped,
        });
        return {
          sprint: result.sprint,
          count: result.tasks.length,
          tasks: result.tasks.map(brief),
        };
      })
  );

  server.registerTool(
    "get_task",
    {
      title: "Get task",
      description: "Full detail for one card: description, notes, URL, reviewer and review state.",
      inputSchema: { id: taskId },
      annotations: readOnly,
    },
    ({ id }) => run(connect, async board => detail(await board.getTask(id)))
  );

  server.registerTool(
    "create_task",
    {
      title: "Create task",
      description:
        "Add a card (status todo) and assign it. Emails the assignees unless notify is false. " +
        "With assign_whole_team, creates one card per Board member on the team, as the website does.",
      inputSchema: {
        title: z.string().min(1),
        description: z
          .string()
          .describe(`What needs doing, at least ${MIN_TASK_DESCRIPTION_LENGTH} characters.`),
        expected_hours: z.number().min(0).max(MAX_EXPECTED_HOURS),
        assignees: z.array(personRef).optional().describe("Who does the work."),
        assign_whole_team: z
          .boolean()
          .optional()
          .describe(
            "Give every Board member on `team` their own copy instead of naming assignees."
          ),
        team: z.string().optional().describe("Team key or label. Defaults to your first team."),
        reviewer: personRef.optional().describe("Who approves it. Optional."),
        due_date: z
          .string()
          .optional()
          .describe("Expected completion date, YYYY-MM-DD. Defaults to the sprint's end date."),
        relevant_url: z.string().optional().describe("Optional http(s) link (doc, PR, design)."),
        sprints: z
          .array(z.union([z.number().int(), z.string().min(1)]))
          .optional()
          .describe('Sprints the card belongs to. Defaults to ["active"].'),
        notify: z.boolean().optional().describe("Email the assignees (default true)."),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    input =>
      run(connect, async board => {
        const { tasks, warnings } = await board.createTask(input);
        return { created: tasks.map(detail), warnings };
      })
  );

  server.registerTool(
    "update_task",
    {
      title: "Update task",
      description:
        "Edit a card's fields, reassign it, change its reviewer, or move it between sprints. " +
        "Only the fields you pass change. Use move_task for status.",
      inputSchema: {
        id: taskId,
        title: z.string().optional(),
        description: z.string().optional(),
        team: z.string().optional(),
        expected_hours: z.number().min(0).max(MAX_EXPECTED_HOURS).optional(),
        actual_hours: z.number().min(0).nullable().optional(),
        due_date: z.string().optional().describe("YYYY-MM-DD"),
        relevant_url: z.string().nullable().optional().describe("null or empty clears it."),
        progress_notes: z
          .string()
          .nullable()
          .optional()
          .describe(`Replaces the notes; at most ${MAX_PROGRESS_NOTES_WORDS} words.`),
        reviewer: personRef.nullable().optional().describe("null removes the reviewer."),
        assignees: z.array(personRef).optional().describe("Replace all assignees with these."),
        add_assignees: z.array(personRef).optional(),
        remove_assignees: z.array(personRef).optional(),
        sprints: z
          .array(z.union([z.number().int(), z.string().min(1)]))
          .optional()
          .describe("Replace the sprints this card belongs to."),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    },
    ({ id, ...patch }) =>
      run(connect, async board => {
        const { task, notes } = await board.updateTask(id, patch);
        return { task: detail(task), notes };
      })
  );

  server.registerTool(
    "move_task",
    {
      title: "Move task",
      description:
        "Change a card's column. pending_review and done need actual_hours (pass it here to log " +
        "it at the same time). pending_review needs a reviewer and emails them. A card with a " +
        "reviewer reaches done only through that reviewer's review_task approval. cancelled drops it.",
      inputSchema: {
        id: taskId,
        status,
        actual_hours: z.number().min(0).optional().describe("Hours actually spent."),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    ({ id, status: next, actual_hours }) =>
      run(connect, async board => {
        const { task, warnings } = await board.moveTask(id, next, actual_hours);
        return { task: detail(task), warnings };
      })
  );

  server.registerTool(
    "review_task",
    {
      title: "Review task",
      description:
        "As the card's reviewer, approve it (moves to done) or send it back to in_progress. " +
        "The board has nowhere to store feedback on a send-back, so tell the assignees directly.",
      inputSchema: {
        id: taskId,
        decision: z.enum(["approve", "send_back"]),
        comment: z.string().optional().describe("Optional note saved with an approval."),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    },
    ({ id, decision, comment }) =>
      run(connect, async board => detail(await board.reviewTask(id, decision, comment)))
  );

  server.registerTool(
    "delete_task",
    {
      title: "Delete task",
      description:
        "Permanently delete a card on an open sprint. Prefer move_task to cancelled to keep history.",
      inputSchema: { id: taskId },
      annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
    },
    ({ id }) =>
      run(connect, async board => {
        const task = await board.deleteTask(id);
        return { deleted: brief(task) };
      })
  );
}
