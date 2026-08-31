import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { supabase } from "src/Utils/supabase";

export type TalentLensAuthStatus = "loading" | "signed_out" | "denied" | "allowed";

export interface TalentLensAuthState {
  status: TalentLensAuthStatus;
  user: User | null;
  role: string | null;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useTalentLensAuth(): TalentLensAuthState {
  const [status, setStatus] = useState<TalentLensAuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    setStatus("loading");

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      setUser(null);
      setRole(null);
      setStatus("signed_out");
      setError(userError.message);
      return;
    }

    const currentUser = userData.user;
    if (!currentUser?.email) {
      setUser(null);
      setRole(null);
      setStatus("signed_out");
      return;
    }

    const { data: allowlistRow, error: allowlistError } = await supabase
      .from("TalentLensUsers")
      .select("email, role, active")
      .eq("email", currentUser.email.toLowerCase())
      .maybeSingle();

    if (allowlistError) {
      setUser(currentUser);
      setRole(null);
      setStatus("denied");
      setError(allowlistError.message);
      return;
    }

    if (!allowlistRow?.active) {
      setUser(currentUser);
      setRole(null);
      setStatus("denied");
      return;
    }

    setUser(currentUser);
    setRole(allowlistRow.role ?? "recruiter");
    setStatus("allowed");
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { status, user, role, error, refresh };
}
