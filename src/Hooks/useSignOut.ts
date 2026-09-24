import { toast } from "react-hot-toast";
import { supabase } from "src/Utils/supabase";
import { useAuthStore } from "src/Sites/Members/Hooks/useAuthStore";

export function useSignOut() {
  const { setAuthState, setUser, setAdminLevel } = useAuthStore();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }

    setAuthState("signin");
    setUser(null);
    setAdminLevel(null);
    toast.success("Logged out successfully!");
  };

  return { handleSignOut };
}
