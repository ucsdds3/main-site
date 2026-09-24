import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const missingSupabaseError = new Error(
  "Supabase environment variables are not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
);

type MissingSupabaseQuery = {
  (...args: unknown[]): MissingSupabaseQuery;
  then: Promise<{ data: null; error: Error }>["then"];
};

const createMissingSupabaseQuery = (): MissingSupabaseQuery => {
  const response = Promise.resolve({ data: null, error: missingSupabaseError });
  let query: MissingSupabaseQuery;

  query = new Proxy(() => query, {
    apply: () => query,
    get: (_, property) => {
      if (property === "then") return response.then.bind(response);
      return () => query;
    },
  }) as MissingSupabaseQuery;

  return query;
};

const createMissingSupabaseClient = () =>
  ({
    auth: new Proxy(
      {},
      {
        get: () => () =>
          Promise.resolve({
            data: { user: null, session: null },
            error: missingSupabaseError,
          }),
      }
    ),
    from: () => createMissingSupabaseQuery(),
    rpc: () => createMissingSupabaseQuery(),
    storage: {
      from: () => createMissingSupabaseQuery(),
    },
  }) as unknown as SupabaseClient;

/** Share auth cookies across members.* / www / apex of the club domain. */
function authCookieDomain(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1" || host === "::1") return undefined;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return undefined;
  if (host === "ds3atucsd.com" || host.endsWith(".ds3atucsd.com")) return ".ds3atucsd.com";
  return undefined;
}

function createSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseKey) return createMissingSupabaseClient();

  const domain = authCookieDomain();
  // Cookie storage so login on members.* is visible on www / apex (and vice versa).
  return createBrowserClient(supabaseUrl, supabaseKey, {
    cookieOptions: domain
      ? {
          domain,
          path: "/",
          sameSite: "lax",
          secure: true,
        }
      : {
          path: "/",
          sameSite: "lax",
        },
  });
}

export const supabase = createSupabaseClient();

/**
 * One-time: copy a legacy localStorage session into cookie storage so existing
 * logged-in members keep their session after the cross-subdomain cookie switch.
 */
export async function migrateLegacyAuthStorage(): Promise<void> {
  if (typeof window === "undefined" || !supabaseUrl) return;

  try {
    const { data: existing } = await supabase.auth.getSession();
    if (existing.session) return;

    const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
    const storageKey = `sb-${projectRef}-auth-token`;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;

    const parsed = JSON.parse(raw) as {
      access_token?: string;
      refresh_token?: string;
      currentSession?: { access_token?: string; refresh_token?: string };
    };
    const access_token = parsed.access_token ?? parsed.currentSession?.access_token;
    const refresh_token = parsed.refresh_token ?? parsed.currentSession?.refresh_token;
    if (!access_token || !refresh_token) return;

    await supabase.auth.setSession({ access_token, refresh_token });
  } catch {
    /* ignore corrupt legacy storage */
  }
}

/** Kept for scripts that need a non-cookie client (rare). */
export function createEphemeralSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseKey) return createMissingSupabaseClient();
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
