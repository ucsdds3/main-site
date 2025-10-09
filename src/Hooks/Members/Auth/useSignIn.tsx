import { useState } from "react";
import { useSiteHandler } from "../../useSiteHandler";
import { useAuthStore } from "./useAuthStore";
import { supabase } from "../../../Utils/supabase";
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

    if (error) {
      toast.error(error?.message);
      return;
    }

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

    setUser(userData.user);
    setAuthState("authenticated");
    localStorage.setItem("user", JSON.stringify(userData.user));
    // 4Immediately ensure user has a Members profile (via RPC)
    try {
      const full = userData.user.user_metadata?.full_name || "";
      const [first, ...rest] = full.trim().split(/\s+/);
      const last = rest.join(" ") || "-";
      const year = String(userData.user.user_metadata?.graduation_year || new Date().getFullYear());
      const major = userData.user.user_metadata?.major || "Undeclared";
      const dob = userData.user.user_metadata?.date_of_birth || "2000-01-01";
      const gender = userData.user.user_metadata?.gender || null;

      const { data: rpcData, error: rpcError } = await supabase.rpc("create_member_profile", {
        first_name: first || "-",
        last_name: last,
        year_text: year,
        major_text: major,
        dob,
        gender_text: gender,
      });

      if (rpcError) {
        console.error("Member RPC error:", rpcError.message);
      } else if (rpcData === "created") {
        console.log("✅ Member profile created successfully");
      } else if (rpcData === "exists") {
        console.log("ℹ️ Member already exists");
      }
    } catch (err) {
      console.error("RPC failed:", err);
    }
    navigate({ pathname: "/", subdomain: "members" });
    toast.success("Login successful!");
  };

  return {
    data,
    setData,
    handleSignin,
  };
}
