import { toast } from "react-hot-toast";
import { supabase } from "../../Utils/supabase";
import { useAuthStore } from "./useAuthStore";

export function useSignOut() {
  const { setAuthState, setUser } = useAuthStore();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }

    setAuthState("signin");
    setUser(null);
    localStorage.removeItem("user");
    toast.success("Logged out successfully!");
  };

  return { handleSignOut };
}
