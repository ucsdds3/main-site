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

function expireCookie(name: string, domain?: string) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const domainPart = domain ? `; domain=${domain}` : "";
  document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0; SameSite=Lax${domainPart}${secure}`;
}

/**
 * Wipe Supabase auth cookies at host-only AND .ds3atucsd.com scopes, plus legacy
 * localStorage keys. Needed after switching to shared-domain cookies — duplicate /
 * stale cookies make login fail everywhere except a clean profile (incognito).
 */
export function clearSupabaseAuthArtifacts(): void {
  if (typeof window === "undefined") return;

  const names = document.cookie
    .split(";")
    .map(part => part.trim().split("=")[0])
    .filter(Boolean)
    .map(name => {
      try {
        return decodeURIComponent(name);
      } catch {
        return name;
      }
    });

  const authCookieNames = names.filter(
    name =>
      name.startsWith("sb-") &&
      (name.includes("auth-token") ||
        name.includes("code-verifier") ||
        name.includes("auth-token-code-verifier"))
  );

  const domain = authCookieDomain();
  for (const name of authCookieNames) {
    expireCookie(name);
    if (domain) expireCookie(name, domain);
  }

  // Known chunk suffixes even if not currently listed in document.cookie
  if (supabaseUrl) {
    try {
      const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
      const base = `sb-${projectRef}-auth-token`;
      const extras = [base, `${base}-code-verifier`, ...Array.from({ length: 10 }, (_, i) => `${base}.${i}`)];
      for (const name of extras) {
        expireCookie(name);
        if (domain) expireCookie(name, domain);
      }
    } catch {
      /* ignore */
    }
  }

  try {
    const keys = Object.keys(window.localStorage);
    for (const key of keys) {
      if (key.startsWith("sb-") && (key.includes("auth") || key.includes("code-verifier"))) {
        window.localStorage.removeItem(key);
      }
    }
  } catch {
    /* private mode / blocked storage */
  }
}

function createSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseKey) return createMissingSupabaseClient();

  const domain = authCookieDomain();
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
 * If cookie storage has no usable session, try once to import a legacy localStorage
 * session. On failure, wipe artifacts so a normal login can succeed.
 */
export async function migrateLegacyAuthStorage(): Promise<void> {
  if (typeof window === "undefined" || !supabaseUrl) return;

  try {
    const { data: existing } = await supabase.auth.getSession();
    if (existing.session) {
      // Validate — stale refresh tokens leave a zombie session that blocks login.
      const { error } = await supabase.auth.getUser();
      if (!error) return;
      clearSupabaseAuthArtifacts();
      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
      return;
    }

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
    if (!access_token || !refresh_token) {
      clearSupabaseAuthArtifacts();
      return;
    }

    const { error: setError } = await supabase.auth.setSession({ access_token, refresh_token });
    if (setError) {
      clearSupabaseAuthArtifacts();
      return;
    }
    const { error: userError } = await supabase.auth.getUser();
    if (userError) clearSupabaseAuthArtifacts();
  } catch {
    clearSupabaseAuthArtifacts();
  }
}

/** Kept for scripts that need a non-cookie client (rare). */
export function createEphemeralSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseKey) return createMissingSupabaseClient();
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
