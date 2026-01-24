import { User } from "@supabase/supabase-js";
import { create } from "zustand";
import { AuthState } from "../../../Utils/types";

interface AuthStateStore {
  user: User | null;
  authState: AuthState;
  adminLevel: number;
  setUser: (user: User | null) => void;
  setAuthState: (authState: AuthState) => void;
  setAdminLevel: (adminLevel: number) => void;
}

export const useAuthStore = create<AuthStateStore>(set => ({
  user: null,
  authState: "signin",
  adminLevel: 0,
  setAuthState: authState => set({ authState }),
  setUser: user => set({ user }),
  setAdminLevel: adminLevel => set({ adminLevel }),
}));
