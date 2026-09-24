import { useEffect } from "react";
import { AuthState } from "../Utils/types";
import { useAuthStore } from "../Sites/Members/Hooks/useAuthStore";
import {
  clearSupabaseAuthArtifacts,
  migrateLegacyAuthStorage,
  supabase,
} from "../Utils/supabase";
import { User } from "@supabase/supabase-js";

async function hydrateUser(user: User, urlAuthState: AuthState | null) {
  const { data: members } = await supabase
    .from("Members")
    .select("admin_level")
    .eq("email", user.email)
    .limit(1);

  // URL authState is only for signup/reset flows — never override a real session with "signin".
  const nextState: AuthState =
    urlAuthState && urlAuthState !== "authenticated" && urlAuthState !== "signin"
      ? urlAuthState
      : "authenticated";

  useAuthStore.setState({
    user,
    authState: nextState,
    adminLevel: members?.[0]?.admin_level ?? null,
  });
}

export function useAuth() {
  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      const urlAuthState = new URLSearchParams(window.location.search).get(
        "authState"
      ) as AuthState | null;

      if (urlAuthState && urlAuthState !== "authenticated" && urlAuthState !== "signin") {
        useAuthStore.setState({ authState: urlAuthState });
      }

      await migrateLegacyAuthStorage();
      if (cancelled) return;

      const tokenHash = new URLSearchParams(window.location.search).get("tokenHash");
      if (tokenHash && tokenHash !== "authenticated") {
        const { data } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        });
        if (cancelled) return;
        if (data?.user) {
          await hydrateUser(data.user, urlAuthState);
          return;
        }
      }

      const { data, error } = await supabase.auth.getUser();
      if (cancelled) return;
      if (error) {
        // Corrupt / conflicting cookies from the domain migration — wipe so login works again.
        clearSupabaseAuthArtifacts();
        await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
        useAuthStore.setState({
          user: null,
          authState:
            urlAuthState && urlAuthState !== "authenticated" ? urlAuthState : "signin",
          adminLevel: null,
        });
        return;
      }
      if (data?.user) {
        await hydrateUser(data.user, urlAuthState);
      }
    };

    boot();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return;
      if (event === "SIGNED_OUT" || !session?.user) {
        useAuthStore.setState({
          user: null,
          authState: "signin",
          adminLevel: null,
        });
        return;
      }
      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED" ||
        event === "INITIAL_SESSION"
      ) {
        await hydrateUser(session.user, null);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);
}
