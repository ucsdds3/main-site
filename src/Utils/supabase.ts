import { createClient } from "@supabase/supabase-js";
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
            data: { user: null },
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

export const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : createMissingSupabaseClient();

/**
 * True when PostgREST can't find a view or function. Until the Members / Events lock-down
 * migration (PublicEvents, BoardMembers, MemberLeaderboard, lookup_event_by_code) is applied,
 * callers fall back to the base tables.
 */
export function isMissingRelation(error: { code?: string } | null): boolean {
  return !!error && ["PGRST205", "PGRST202", "42P01", "42883"].includes(error.code ?? "");
}
