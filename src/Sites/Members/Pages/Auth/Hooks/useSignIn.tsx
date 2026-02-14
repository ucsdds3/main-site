import { useState } from "react";
import { useAuthStore } from "../../../Hooks/useAuthStore";
import { supabase } from "../../../../../Utils/supabase";
import toast from "react-hot-toast";

export function useSignIn() {
  const { setAuthState, setUser, setAdminLevel } = useAuthStore();
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  // const resendVerification = async () => {
  //   const href = window.location.href;
  //   const search = new URLSearchParams(window.location.search);

  //   const { error } = await supabase.auth.resend({
  //     type: "signup",
  //     email: data.email,
  //     options: { emailRedirectTo: `${href}${search && "&"}authState=signin` },
  //   });

  //   if (error) {
  //     toast.error(error.message);
  //     return;
  //   }

  //   toast.success("Verification email resent!");
  // };

  const handleSignin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { data: userData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    // const emailVerified = userData.user?.user_metadata.email_verified;
    // if (error || !emailVerified) {
    //   if (error?.message == "Email not confirmed" || !emailVerified) {
    //     toast(
    //       <div>
    //         <span>Please verify your email to login.</span>
    //         <button className="underline text-blue-500 cursor-pointer" onClick={resendVerification}>
    //           Resend Verification Email
    //         </button>
    //       </div>
    //     );
    //   } else toast.error(error?.message || "An error occurred");
    //   return;
    // }

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
    console.log("adminData: ", adminData);
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
