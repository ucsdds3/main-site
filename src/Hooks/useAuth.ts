import { useEffect } from "react";
import { AuthState } from "../Utils/types";
import { useAuthStore } from "../Sites/Members/Hooks/useAuthStore";
import { supabase } from "../Utils/supabase";
import { User } from "@supabase/supabase-js";

export function useAuth() {
  useEffect(() => {
    const getUser = async () => {
      const authState = new URLSearchParams(window.location.search).get("authState") as AuthState;
      if (authState && authState != "authenticated") {
        useAuthStore.setState({ authState });
      }

      const foundUser = async (user: User) => {
        const { data: members } = await supabase
          .from("Members")
          .select("admin_level")
          .eq("email", user.email)
          .limit(1);

        useAuthStore.setState({
          user,
          authState: authState || "authenticated",
          adminLevel: members?.[0]?.admin_level ?? null,
        });
      };

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

      const user = localStorage.getItem("user");
      if (user) return foundUser(JSON.parse(user));
    };

    getUser();
  }, []);
}
