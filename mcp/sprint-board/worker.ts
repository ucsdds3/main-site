/**
 * Hosted DS3 sprint board MCP server (Cloudflare Worker).
 *
 * The same tools as server.ts, served over Streamable HTTP at /mcp so the Claude apps (web,
 * desktop, mobile) can add it as a custom connector. Connecting runs an OAuth flow whose
 * sign-in page takes the member's DS3 portal email + password: the Worker signs in to
 * Supabase as them, and every tool call runs with that member's own Supabase session, so the
 * sprints RLS policies apply exactly as on the website. No service-role key is involved.
 *
 * Deploy + connect: docs/SPRINT_BOARD_MCP.md. Config: wrangler.jsonc.
 */
import {
  AuthorizationError,
  CimdFetchError,
  type ConsentDescription,
  OAuthError,
  type OAuthHelpers,
  OAuthProvider,
} from "@cloudflare/workers-oauth-provider";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { CfWorkerJsonSchemaValidator } from "@modelcontextprotocol/sdk/validation/cfworker";
import { createClient, type Session } from "@supabase/supabase-js";

import { BoardError, SprintBoard } from "./board";
import { INSTRUCTIONS, registerTools, SERVER_INFO } from "./tools";

type Env = {
  OAUTH_KV: KVNamespace;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  /** Optional canonical origin (e.g. https://sprints.example.com); defaults to the request's. */
  PUBLIC_ORIGIN?: string;
  /** Injected by OAuthProvider for the default handler. */
  OAUTH_PROVIDER: OAuthHelpers;
};

type Member = { memberId: number; email: string; name: string };
/** Stored with the grant: enough to mint the next Supabase session. */
type GrantProps = Member & { refreshToken: string };
/** Stored with each access token: the Supabase session the tools run as. */
type AccessProps = Member & { accessToken: string; expiresAt: number };
/** What the sign-in page hands to completeAuthorization, split by tokenExchangeCallback. */
type LoginProps = GrantProps & AccessProps;

const MCP_PATH = "/mcp";

function supabase(env: Env, accessToken?: string) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
  });
}

function sessionProps(member: Member, session: Session): LoginProps {
  return {
    ...member,
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at ?? Math.floor(Date.now() / 1000) + session.expires_in,
  };
}

/** Our access token expires a minute before the Supabase session it carries. */
function ttlFor(expiresAt: number): number {
  return Math.max(60, expiresAt - Math.floor(Date.now() / 1000) - 60);
}

function split(props: LoginProps) {
  const { refreshToken, accessToken, expiresAt, ...member } = props;
  return {
    accessTokenProps: { ...member, accessToken, expiresAt } satisfies AccessProps,
    newProps: { ...member, refreshToken } satisfies GrantProps,
    accessTokenTTL: ttlFor(expiresAt),
  };
}

// ------------------------------------------------------------------ MCP endpoint

const mcpHandler = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const props = (ctx as ExecutionContext & { props: AccessProps }).props;
    const board = new SprintBoard(supabase(env, props.accessToken), props.accessToken);
    const server = new McpServer(SERVER_INFO, {
      instructions: INSTRUCTIONS,
      jsonSchemaValidator: new CfWorkerJsonSchemaValidator(),
    });
    registerTools(server, async () => board);
    // Stateless: each request carries its own bearer token, so there is no session to keep.
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    await server.connect(transport);
    return transport.handleRequest(request);
  },
};

// ------------------------------------------------------------------ sign-in page

const escape = (value: string) => value.replace(/[&<>"']/g, ch => `&#${ch.charCodeAt(0)};`);

function page(title: string, body: string, headers = new Headers(), status = 200): Response {
  headers.set("Content-Type", "text/html; charset=utf-8");
  return new Response(
    `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)}</title>
<style>
  :root { color-scheme: dark; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 16px;
    background: #050a14; color: #e2e8f0; font: 15px/1.5 system-ui, sans-serif; }
  main { width: 100%; max-width: 420px; background: #0b1424; border: 1px solid #1e2a3d;
    border-radius: 16px; padding: 28px; }
  h1 { font-size: 20px; margin: 0 0 8px; }
  p { margin: 0 0 12px; color: #94a3b8; }
  strong { color: #e2e8f0; }
  .warn { color: #fbbf24; }
  .error { color: #fca5a5; }
  label { display: block; margin: 14px 0 4px; font-size: 13px; color: #94a3b8; }
  input { width: 100%; box-sizing: border-box; padding: 10px 12px; border-radius: 10px;
    border: 1px solid #1e2a3d; background: #050a14; color: inherit; font: inherit; }
  .row { display: flex; flex-direction: row-reverse; gap: 10px; margin-top: 20px; }
  button { flex: 1; padding: 10px; border-radius: 10px; border: 1px solid #1e2a3d;
    background: transparent; color: inherit; font: inherit; cursor: pointer; }
  button[value="approve"] { background: #19b5ca; border-color: #19b5ca; color: #04121a;
    font-weight: 600; }
</style>
</head>
<body><main>${body}</main></body>
</html>`,
    { status, headers }
  );
}

/** The sign-in form. `details` is shown on first load; a retry after a wrong password omits it. */
function signInPage(handle: string, details?: ConsentDescription, error?: string): string {
  let about = "";
  if (details) {
    const origin = details.clientDomain
      ? `Published by <strong>${escape(details.clientDomain)}</strong>.`
      : "This app registered itself, so its name is not verified.";
    const loopback = details.redirectIsLoopback
      ? '<p class="warn">This sends access to an app on your computer. Continue only if you just started connecting from it.</p>'
      : "";
    about = `<p><strong>${escape(details.clientName || "An app")}</strong> wants to connect. ${origin}
Access will be sent to <strong>${escape(details.redirectHost)}</strong>.</p>${loopback}`;
  }
  return `<h1>Connect the DS3 sprint board</h1>
${about}
<p>It will be able to read the sprint board and create, assign, move and review tasks as you.
Board and Executive members only.</p>
${error ? `<p class="error">${escape(error)}</p>` : ""}
<form method="post">
  <input type="hidden" name="handle" value="${escape(handle)}">
  <label for="email">DS3 members-portal email</label>
  <input id="email" name="email" type="email" autocomplete="username" required>
  <label for="password">Password</label>
  <input id="password" name="password" type="password" autocomplete="current-password" required>
  <!-- Approve comes first so pressing Enter (implicit submission) signs in instead of denying;
       row-reverse keeps Deny on the left. -->
  <div class="row">
    <button name="decision" value="approve">Sign in and allow</button>
    <button name="decision" value="deny" formnovalidate>Deny</button>
  </div>
</form>`;
}

const NO_FRAMING = {
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "frame-ancestors 'none'",
};

/** Sign in with the portal password and confirm the member may use the sprint board. */
async function signIn(env: Env, email: string, password: string): Promise<LoginProps> {
  const sb = supabase(env);
  const { data, error } = await sb.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error || !data.session) throw new BoardError("Wrong email or password.");
  const me = await new SprintBoard(sb).whoami();
  return sessionProps({ memberId: me.id, email: me.email, name: me.full_name }, data.session);
}

const defaultHandler = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== "/authorize") {
      return new Response(
        `DS3 sprint board MCP server.\n\nAdd ${url.origin}${MCP_PATH} as a custom connector in Claude.\n`,
        { headers: { "Content-Type": "text/plain; charset=utf-8" } }
      );
    }

    const oauth = env.OAUTH_PROVIDER;
    try {
      if (request.method === "GET") {
        const authRequest = await oauth.parseAuthRequest(request);
        const details = await oauth.describeConsent(authRequest);
        const consent = await oauth.beginConsent(authRequest);
        return page(
          "Connect the DS3 sprint board",
          signInPage(consent.handle, details),
          consent.headers
        );
      }
      if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

      const form = await request.formData();
      const handle = String(form.get("handle") ?? "");
      if (form.get("decision") !== "approve") {
        console.log("authorize: denied by user");
        const denied = await oauth.denyConsent(request, handle);
        return new Response(null, { status: 302, headers: denied.headers });
      }

      let props: LoginProps;
      try {
        props = await signIn(
          env,
          String(form.get("email") ?? ""),
          String(form.get("password") ?? "")
        );
      } catch (err) {
        // The handle is only spent by approve/deny, so the same form can be retried.
        const message = err instanceof BoardError ? err.message : "Sign-in failed. Try again.";
        return page(
          "Connect the DS3 sprint board",
          signInPage(handle, undefined, message),
          new Headers(NO_FRAMING),
          401
        );
      }

      const approved = await oauth.approveConsent(request, handle);
      const { redirectTo } = await oauth.completeAuthorization({
        request: approved.request,
        userId: String(props.memberId),
        metadata: { email: props.email },
        scope: approved.request.scope,
        props,
      });
      approved.headers.set("Location", redirectTo);
      console.log("authorize: approved", { memberId: props.memberId });
      return new Response(null, { status: 302, headers: approved.headers });
    } catch (error) {
      if (error instanceof AuthorizationError) {
        console.warn("authorize: rejected", { code: error.code, description: error.description });
      }
      if (error instanceof AuthorizationError && error.redirectTo) {
        return Response.redirect(error.redirectTo, 302);
      }
      if (error instanceof AuthorizationError || error instanceof CimdFetchError) {
        const message =
          error instanceof AuthorizationError
            ? error.description
            : "This app could not be verified.";
        return page(
          "Can't connect",
          `<h1>Can't connect</h1><p>${escape(message)}</p><p>Start connecting again from Claude.</p>`,
          new Headers(NO_FRAMING),
          400
        );
      }
      throw error;
    }
  },
};

// ------------------------------------------------------------------ OAuth provider

const providers = new Map<string, OAuthProvider<Env>>();

function providerFor(origin: string): OAuthProvider<Env> {
  let provider = providers.get(origin);
  if (!provider) {
    provider = new OAuthProvider<Env>({
      apiRoute: MCP_PATH,
      apiHandler: mcpHandler,
      defaultHandler,
      authorizeEndpoint: "/authorize",
      tokenEndpoint: "/oauth/token",
      clientRegistrationEndpoint: "/oauth/register",
      clientIdMetadataDocumentEnabled: true,
      // Grants stay alive while they're used; an idle connector signs in again after 30 days.
      refreshTokenIdleTTL: 30 * 24 * 60 * 60,
      resourceMetadata: {
        resource: `${origin}${MCP_PATH}`,
        authorization_servers: [origin],
        resource_name: "DS3 sprint board",
      },
      tokenExchangeCallback: async ({ grantType, props, env }) => {
        if (grantType === "authorization_code") return split(props as LoginProps);
        if (grantType !== "refresh_token") return;
        const grant = props as GrantProps;
        const { data, error } = await supabase(env).auth.refreshSession({
          refresh_token: grant.refreshToken,
        });
        if (error || !data.session) {
          throw new OAuthError("invalid_grant", {
            description: "Your DS3 session ended. Reconnect the sprint board to sign in again.",
          });
        }
        const { memberId, email, name } = grant;
        return split(sessionProps({ memberId, email, name }, data.session));
      },
    });
    providers.set(origin, provider);
  }
  return provider;
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const origin = env.PUBLIC_ORIGIN || new URL(request.url).origin;
    return providerFor(origin).fetch(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
