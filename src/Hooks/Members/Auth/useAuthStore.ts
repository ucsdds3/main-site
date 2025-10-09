import { User } from "@supabase/supabase-js";
import { create } from "zustand";
import { AuthState } from "../../../Utils/types";

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

