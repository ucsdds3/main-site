import toast from "react-hot-toast";
import { supabase } from "../../../../../Utils/supabase";
import { useState } from "react";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.email("Invalid email format").regex(/@ucsd\.edu$/, "Must be a UCSD email address"),
});

export function useForgotPassword() {
  const [email, setEmail] = useState("");

  const handleForgotPassword = async (
    e?: React.FormEvent<HTMLFormElement>,
    overrideEmail?: string
  ) => {
    e?.preventDefault();

    const result = forgotPasswordSchema.safeParse({ email: overrideEmail || email });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set("authState", "reset-password");
    const { data, error } = await supabase.auth.resetPasswordForEmail(overrideEmail || email, {
      redirectTo: url.toString(),
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
