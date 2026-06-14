import { useEffect } from "react";
import { AuthState } from "../Utils/types";
import { useAuthStore } from "../Sites/Members/Hooks/useAuthStore";
import { supabase } from "../Utils/supabase";
import { User } from "@supabase/supabase-js";

async function syncMemberEmail(user: User): Promise<User> {
  const oldEmail = user.user_metadata?.email?.toLowerCase();
  const currentEmail = user.email?.toLowerCase();
  if (!oldEmail || !currentEmail || oldEmail === currentEmail) {
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

  const { data: updated } = await supabase.auth.updateUser({
    data: { ...user.user_metadata, email: currentEmail },
  });

  return updated?.user ?? user;
}

export function useAuth() {
  useEffect(() => {
    const foundUser = async (user: User) => {
      const syncedUser = await syncMemberEmail(user);
      const authState = new URLSearchParams(window.location.search).get("authState") as AuthState;

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
        if (data?.user) return foundUser(data.user);
      }

      const { data } = await supabase.auth.getUser();
      if (data?.user) return foundUser(data.user);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && (event === "USER_UPDATED" || event === "SIGNED_IN")) {
        await foundUser(session.user);
      }
    });

    getUser();

    return () => subscription.unsubscribe();
  }, []);
}
