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
