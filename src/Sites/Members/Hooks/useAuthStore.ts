import { User } from "@supabase/supabase-js";
import { create } from "zustand";
import { AuthState } from "../../../Utils/types";
import { AdminLevel } from "../Pages/Admin/Utils/types";

interface AuthStateStore {
  user: User | null;
  authState: AuthState;
  adminLevel: AdminLevel | null;
  setUser: (user: User | null) => void;
  setAuthState: (authState: AuthState) => void;
  setAdminLevel: (adminLevel: AdminLevel | null) => void;
}

export const useAuthStore = create<AuthStateStore>(set => ({
  user: null,
  authState: "signin",
  adminLevel: null,
  setAuthState: authState => set({ authState }),
  setUser: user => set({ user }),
  setAdminLevel: adminLevel => set({ adminLevel }),
}));
