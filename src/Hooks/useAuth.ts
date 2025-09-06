import { User } from "@supabase/supabase-js";
import { useEffect } from "react";
import { create } from "zustand";
import { supabase } from "../Utils/supabase";

type AuthState = "signin" | "signup" | "forgot-password" | "reset-password" | "authenticated";

interface AuthStateStore {
  user: User | null;
  authState: AuthState;
  setUser: (user: User | null) => void;
  setAuthState: (authState: AuthState) => void;
}

export const useAuthStore = create<AuthStateStore>((set) => ({
  user: null,
  authState: "signin",
  setAuthState: (authState) => set({ authState }),
  setUser: (user) => set({ user }),
}));

export const useAuth = () => {
  useEffect(() => {
    const getUser = async () => {
      const authState = new URLSearchParams(window.location.search).get("authState") as AuthState;
      if (authState && authState != "authenticated") useAuthStore.setState({ authState });
      
      const tokenHash = new URLSearchParams(window.location.search).get("tokenHash");
      if (tokenHash && tokenHash != "authenticated") {
        const { data } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        });
        if (data?.user) useAuthStore.setState({ user: data.user });
      }

      const { data } = await supabase.auth.getUser();
      if (data?.user) useAuthStore.setState({ user: data.user });
    };

    getUser();
  }, []);
};
