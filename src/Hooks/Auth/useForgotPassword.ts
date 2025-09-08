import toast from "react-hot-toast";
import { supabase } from "../../Utils/supabase";
import { useState } from "react";

export function useForgotPassword() {
  const [email, setEmail] = useState("");

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const href = window.location.href;
    const search = new URLSearchParams(window.location.search);
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${href}${search && "&"}authState=reset-password`,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    console.log(data);
    toast.success("Reset link sent to email");
  };

  return {
    email,
    setEmail,
    handleForgotPassword,
  };
}
