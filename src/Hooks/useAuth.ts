import { useEffect } from "react";
import { AuthState } from "../Utils/types";
import { useAuthStore } from "../Sites/Members/Hooks/useAuthStore";
import { supabase } from "../Utils/supabase";
import { User } from "@supabase/supabase-js";

async function syncMemberEmailIfConfirmed(user: User): Promise<User> {
  const pendingEmail = user.user_metadata?.pending_email?.toLowerCase();
  const currentEmail = user.email?.toLowerCase();
  const metadataEmail = user.user_metadata?.email?.toLowerCase();

  if (!pendingEmail || !currentEmail || currentEmail !== pendingEmail) {
    return user;
  }
  if (metadataEmail === currentEmail) {
    return user;
  }

  const oldEmail = metadataEmail;
  if (!oldEmail) {
    return user;
  }

  const { error: memberError } = await supabase
    .from("Members")
    .update({ email: currentEmail })
    .eq("email", oldEmail);

  if (memberError) {
    console.error("Failed to sync member email:", memberError.message);
    return user;
  }

  const { data: updated, error: userError } = await supabase.auth.updateUser({
    data: {
      ...user.user_metadata,
      email: currentEmail,
      pending_email: null,
    },
  });

  if (userError) {
    console.error("Failed to clear pending email in metadata:", userError.message);
    return user;
  }

  return updated?.user ?? user;
}

export function useAuth() {
  useEffect(() => {
    const hydrateUser = async (user: User, authStateOverride?: AuthState | null) => {
      const syncedUser = await syncMemberEmailIfConfirmed(user);
      const authState =
        authStateOverride ??
        (new URLSearchParams(window.location.search).get("authState") as AuthState);

      const { data: members } = await supabase
        .from("Members")
        .select("admin_level")
        .eq("email", syncedUser.email)
        .limit(1);

      useAuthStore.setState({
        user: syncedUser,
        authState: authState || "authenticated",
        adminLevel: members?.[0]?.admin_level ?? null,
      });
    };

    const getUser = async () => {
      const authState = new URLSearchParams(window.location.search).get("authState") as AuthState;
      if (authState && authState != "authenticated") {
        useAuthStore.setState({ authState });
      }

      const tokenHash = new URLSearchParams(window.location.search).get("tokenHash");
      if (tokenHash && tokenHash != "authenticated") {
        const { data } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        });
        if (data?.user) return hydrateUser(data.user, authState);
      }

      const { data } = await supabase.auth.getUser();
      if (data?.user) return hydrateUser(data.user, authState);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session?.user) return;
      if (event !== "USER_UPDATED" && event !== "SIGNED_IN" && event !== "TOKEN_REFRESHED") {
        return;
      }

      await hydrateUser(session.user);
    });

    getUser();

    return () => subscription.unsubscribe();
  }, []);
}
