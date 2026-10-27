/**
 * DS3 sprint board MCP server (stdio).
 *
 * Lets Claude Code (or any MCP client) review the /sprints board, add tasks, and assign
 * them. It signs in to Supabase as you with the public anon key + your members-portal
 * password, so the sprints RLS policies apply exactly as they do on members.ds3atucsd.com.
 * No service-role key is involved. Setup: docs/SPRINT_BOARD_MCP.md.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createClient } from "@supabase/supabase-js";

import { BoardError, SprintBoard } from "./board";
import { readConfig } from "./env";
import { INSTRUCTIONS, registerTools, SERVER_INFO } from "./tools";

let boardPromise: Promise<SprintBoard> | null = null;

/** Sign in on first use, so a misconfigured server still starts and reports why. */
function connect(): Promise<SprintBoard> {
  boardPromise ??= (async () => {
    const config = readConfig();
    const sb = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: true, detectSessionInUrl: false },
    });
    const { error } = await sb.auth.signInWithPassword({
      email: config.email,
      password: config.password,
    });
    if (error)
      throw new BoardError(`Supabase sign-in failed for ${config.email}: ${error.message}`);
    const board = new SprintBoard(sb);
    await board.whoami();
    return board;
  })().catch(err => {
    boardPromise = null;
    throw err;
  });
  return boardPromise;
}

const server = new McpServer(SERVER_INFO, { instructions: INSTRUCTIONS });
registerTools(server, connect);

const transport = new StdioServerTransport();
await server.connect(transport);
// Supabase's token refresh timer would otherwise keep the process alive after the client goes.
process.stdin.on("close", () => process.exit(0));
console.error("ds3-sprint-board MCP server running on stdio");
