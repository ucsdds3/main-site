import { useState } from "react";
import { useSiteHandler } from "../useSiteHandler";
import { useAuthStore } from "./useAuthStore";
import { supabase } from "../../Utils/supabase";
import toast from "react-hot-toast";

export function useSignIn() {
  const { setAuthState, setUser } = useAuthStore();
  const { navigate } = useSiteHandler();
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const resendVerification = async () => {
    const href = window.location.href;
    const search = new URLSearchParams(window.location.search);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: data.email,
      options: { emailRedirectTo: `${href}${search && "&"}authState=signin` },
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Verification email resent!");
  };

  const handleSignin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { data: userData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (!userData.user?.user_metadata.email_verified) {
      toast(
        <div>
          <span>Please verify your email to login.</span>
          <button
            className="underline text-blue-500 cursor-pointer"
            onClick={resendVerification}
          >
            Resend Verification Email
          </button>
        </div>
      );
      return;
    }

    if (error) {
      toast.error(error?.message);
      return;
    }

    setUser(userData.user);
    localStorage.setItem("user", JSON.stringify(userData.user));
    setAuthState("authenticated");
    navigate({ pathname: "/", subdomain: "members" });
    toast.success("Login successful!");
  };

  return {
    data,
    setData,
    handleSignin,
  };
}
