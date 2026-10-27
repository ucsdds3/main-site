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

/** The DS3 chevron (public/logo.png), inline so the page has no asset requests. */
const LOGO = `<svg class="logo" viewBox="0 0 200 200" aria-hidden="true">
<path d="M25 5h63l97 95H122z" fill="#f58634"/><path d="M122 100h63l-97 95H25z" fill="#19b5ca"/></svg>`;

function page(title: string, body: string, headers = new Headers(), status = 200): Response {
  headers.set("Content-Type", "text/html; charset=utf-8");
  return new Response(
    `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;600&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet">
<style>
  :root {
    color-scheme: dark;
    --text: rgba(255,255,255,0.92); --muted: rgba(255,255,255,0.52); --faint: rgba(255,255,255,0.3);
    --line: rgba(255,255,255,0.08); --line-mid: rgba(255,255,255,0.14);
    --surface: rgba(255,255,255,0.035); --teal: #19b5ca; --orange: #f58634; --red: #ff8a8a;
  }
  * { box-sizing: border-box; }
  html, body { height: 100%; }
  body {
    margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 32px 16px;
    color: var(--text); font: 15px/1.55 "Albert Sans", ui-sans-serif, system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    background:
      radial-gradient(60rem 30rem at 50% -10%, rgba(25,181,202,0.10), transparent 60%),
      radial-gradient(40rem 24rem at 100% 110%, rgba(245,134,52,0.06), transparent 60%),
      linear-gradient(135deg, #05080f 0%, #0b1220 50%, #0d1a2a 100%);
  }
  body::before { /* fine grain so the gradient doesn't band */
    content: ""; position: fixed; inset: 0; pointer-events: none; opacity: 0.05;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }
  main {
    position: relative; width: 100%; max-width: 400px; padding: 40px 36px 32px;
    border: 1px solid var(--line); border-radius: 24px;
    background: linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015));
    box-shadow: 0 1px 0 rgba(255,255,255,0.06) inset, 0 40px 80px -24px rgba(0,0,0,0.6);
    backdrop-filter: blur(12px);
  }
  main > * { animation: rise 0.6s cubic-bezier(.2,.7,.2,1) both; }
  main > *:nth-child(2) { animation-delay: 60ms; } main > *:nth-child(3) { animation-delay: 120ms; }
  main > *:nth-child(4) { animation-delay: 180ms; } main > *:nth-child(5) { animation-delay: 240ms; }
  main > *:nth-child(6) { animation-delay: 300ms; }
  @keyframes rise { from { opacity: 0; transform: translateY(6px); } }
  @media (prefers-reduced-motion: reduce) { main > * { animation: none; } }

  .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
  .logo { width: 22px; height: 22px; }
  .eyebrow { font: 500 10.5px/1 ui-monospace, "SF Mono", Menlo, monospace; letter-spacing: 0.16em;
    text-transform: uppercase; color: var(--muted); }
  h1 { margin: 0 0 10px; font: 400 34px/1.08 "DM Serif Display", Georgia, serif; letter-spacing: -0.01em; }
  h1 em { color: var(--teal); }
  .lede { margin: 0 0 24px; color: var(--muted); }
  .lede strong { color: var(--text); font-weight: 500; }

  .meta { margin: 0 0 24px; padding: 12px 14px; border: 1px solid var(--line); border-radius: 14px;
    background: var(--surface); display: grid; grid-template-columns: auto 1fr; gap: 6px 16px;
    font-size: 13px; }
  .meta dt { color: var(--faint); }
  .meta dd { margin: 0; text-align: right; color: var(--text); overflow-wrap: anywhere; }
  .meta .ok { color: var(--teal); }
  .meta .unverified { color: var(--orange); }
  .note { margin: -12px 0 24px; font-size: 13px; color: var(--orange); }

  .error { display: flex; gap: 10px; align-items: baseline; margin: 0 0 20px; padding: 10px 14px;
    border-radius: 12px; background: rgba(255,138,138,0.08); color: var(--red); font-size: 13.5px; }
  .error::before { content: ""; flex: none; width: 6px; height: 6px; border-radius: 50%;
    background: currentColor; transform: translateY(-1px); }

  .field { margin-bottom: 14px; }
  label { display: block; margin: 0 0 6px; font-size: 12.5px; color: var(--muted); }
  input[type=email], input[type=password] {
    width: 100%; height: 46px; padding: 0 14px; border-radius: 12px; border: 1px solid var(--line-mid);
    background: rgba(5,8,15,0.55); color: var(--text); font: inherit; outline: none;
    transition: border-color .15s, box-shadow .15s, background .15s;
  }
  input::placeholder { color: var(--faint); }
  input:hover { border-color: rgba(255,255,255,0.22); }
  input:focus { border-color: var(--teal); box-shadow: 0 0 0 4px rgba(25,181,202,0.15);
    background: rgba(5,8,15,0.8); }

  .actions { margin-top: 24px; display: grid; gap: 6px; }
  button { font: inherit; cursor: pointer; border: 0; }
  .primary { position: relative; height: 48px; border-radius: 12px; font-weight: 600; color: #03141a;
    background: linear-gradient(180deg, #2cc6da, var(--teal));
    box-shadow: 0 1px 0 rgba(255,255,255,0.35) inset, 0 10px 24px -10px rgba(25,181,202,0.7);
    transition: transform .12s, filter .15s, box-shadow .15s; }
  .primary:hover { filter: brightness(1.06); box-shadow: 0 1px 0 rgba(255,255,255,0.35) inset,
    0 14px 30px -10px rgba(25,181,202,0.85); }
  .primary:active { transform: translateY(1px); }
  .primary:focus-visible, .ghost:focus-visible { outline: 2px solid var(--teal); outline-offset: 3px; }
  .ghost { height: 40px; border-radius: 10px; background: transparent; color: var(--faint);
    transition: color .15s; }
  .ghost:hover { color: var(--muted); }
  form.busy .primary { color: transparent; pointer-events: none; }
  form.busy .primary::after { content: ""; position: absolute; inset: 0; margin: auto; width: 18px;
    height: 18px; border-radius: 50%; border: 2px solid rgba(3,20,26,0.25); border-top-color: #03141a;
    animation: spin .7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .foot { margin: 22px 0 0; padding-top: 18px; border-top: 1px solid var(--line); font-size: 12.5px;
    color: var(--faint); text-align: center; }
  p { margin: 0 0 12px; color: var(--muted); }
  @media (max-width: 440px) { main { padding: 32px 22px 24px; border-radius: 20px; } h1 { font-size: 30px; } }
</style>
</head>
<body><main>${body}</main></body>
</html>`,
    { status, headers }
  );
}

const brand = `<div class="brand">${LOGO}<span class="eyebrow">DS3 · Sprint board</span></div>`;

/** The sign-in form. `details` is shown on first load; a retry after a wrong password omits it. */
function signInPage(
  handle: string,
  details?: ConsentDescription,
  error?: string,
  email = ""
): string {
  const client = escape(details?.clientName || "Claude");
  let meta = "";
  if (details) {
    const publisher = details.clientDomain
      ? `<dd><span class="ok">✓</span> ${escape(details.clientDomain)}</dd>`
      : `<dd class="unverified">Unverified app</dd>`;
    meta = `<dl class="meta">
  <dt>Requested by</dt>${publisher}
  <dt>Access goes to</dt><dd>${escape(details.redirectHost)}</dd>
</dl>${
      details.redirectIsLoopback
        ? '<p class="note">This sends access to an app on your computer. Continue only if you just started connecting from it.</p>'
        : ""
    }`;
  }
  return `${brand}
<h1>Connect <em>${client}</em></h1>
<p class="lede">Sign in with your <strong>members-portal</strong> account. ${client} can then read the
board and create, assign, move and review tasks as you.</p>
${meta}
<form method="post" onsubmit="if (event.submitter && event.submitter.value === 'approve') this.classList.add('busy')">
  ${error ? `<p class="error" role="alert">${escape(error)}</p>` : ""}
  <input type="hidden" name="handle" value="${escape(handle)}">
  <div class="field">
    <label for="email">Email</label>
    <input id="email" name="email" type="email" autocomplete="username" placeholder="you@ucsd.edu"
      value="${escape(email)}" required ${email ? "" : "autofocus"}>
  </div>
  <div class="field">
    <label for="password">Password</label>
    <input id="password" name="password" type="password" autocomplete="current-password" required
      ${email ? "autofocus" : ""}>
  </div>
  <!-- Approve must stay the first submit button: Enter (implicit submission) uses the first one. -->
  <div class="actions">
    <button class="primary" name="decision" value="approve">Sign in and allow</button>
    <button class="ghost" name="decision" value="deny" formnovalidate>Deny</button>
  </div>
</form>
<p class="foot">Board and Executive members only</p>`;
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

      const email = String(form.get("email") ?? "");
      let props: LoginProps;
      try {
        props = await signIn(env, email, String(form.get("password") ?? ""));
      } catch (err) {
        // The handle is only spent by approve/deny, so the same form can be retried.
        const message = err instanceof BoardError ? err.message : "Sign-in failed. Try again.";
        return page(
          "Connect the DS3 sprint board",
          signInPage(handle, undefined, message, email),
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
          `${brand}<h1>Can't connect</h1><p>${escape(message)}</p><p>Start connecting again from Claude.</p>`,
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
