import { useState } from "react";
import { useAuthStore } from "../../../Hooks/useAuthStore";
import { clearSupabaseAuthArtifacts, supabase } from "../../../../../Utils/supabase";
import toast from "react-hot-toast";

export function useSignIn() {
  const { setAuthState, setUser, setAdminLevel } = useAuthStore();
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const handleSignin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Stale host-only + domain cookies from the cross-subdomain auth change block new logins.
    clearSupabaseAuthArtifacts();
    await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);

    const { data: userData, error } = await supabase.auth.signInWithPassword({
      email: data.email.toLowerCase(),
      password: data.password,
    });

    if (error) {
      toast.error(error.message);
      return;
    }
    const { data: adminData, error: adminError } = await supabase
      .from("Members")
      .select("admin_level")
      .eq("email", userData.user.email)
      .limit(1)
      .single();

    if (adminError) {
      toast.error(adminError.message);
      return;
    }
    setAdminLevel(adminData.admin_level);
    setUser(userData.user);
    setAuthState("authenticated");
    toast.success("Login successful!");
  };

  return {
    data,
    setData,
    handleSignin,
  };
}
