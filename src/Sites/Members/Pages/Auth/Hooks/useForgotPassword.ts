import toast from "react-hot-toast";
import { supabase } from "../../../../../Utils/supabase";
import { useState } from "react";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.email("Invalid email format").regex(/\.edu$/, "Must be a .edu email address"),
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

    const emailToUse = overrideEmail || email;

    // Check if account exists before sending reset (avoids confusing "sent" message for non-existent emails)
    const { data: existingMember, error: lookupError } = await supabase
      .from("Members")
      .select("email")
      .eq("email", emailToUse)
      .eq("deleted", false)
      .limit(1)
      .maybeSingle();

    if (lookupError) {
      toast.error(lookupError.message);
      return;
    }
    if (!existingMember) {
      toast.error("No account found with that email address.");
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set("authState", "reset-password");
    url.searchParams.delete("next"); // temporary fix to always go to reset password
    const { error } = await supabase.auth.resetPasswordForEmail(emailToUse, {
      redirectTo: url.toString(),
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Reset link sent to your inbox");
  };

  return {
    email,
    setEmail,
    handleForgotPassword,
  };
}
