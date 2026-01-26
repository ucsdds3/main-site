import { User } from "@supabase/supabase-js";
import { create } from "zustand";
import { AuthState } from "../../../Utils/types";
import { AdminLevel } from "../Pages/Admin/Utils/types";

interface AuthStateStore {
  user: User | null;
  authState: AuthState;
  adminLevel: AdminLevel;
  setUser: (user: User | null) => void;
  setAuthState: (authState: AuthState) => void;
  setAdminLevel: (adminLevel: AdminLevel) => void;
}

export const useAuthStore = create<AuthStateStore>(set => ({
  user: null,
  authState: "signin",
  adminLevel: "Member",
  setAuthState: authState => set({ authState }),
  setUser: user => set({ user }),
  setAdminLevel: adminLevel => set({ adminLevel }),
}));
