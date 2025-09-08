import { useState } from "react";
import z from "zod";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";
import { supabase } from "../../Utils/supabase";

export function useResetPassword() {
  const [errors, setErrors] = useState<string>("");
  const { setAuthState } = useAuthStore();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const resetPasswordSchema = z
    .object({
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          "Password must contain lowercase, uppercase, and number"
        ),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = resetPasswordSchema.safeParse({ password, confirmPassword });

    if (!result.success) {
      const errors = result.error.issues
        .map((issue) => issue.message)
        .join("\n");
      toast.error("Please fix the following errors:\n" + errors);
      console.log(errors);
      setErrors(errors);
      return;
    }

    const tokenHash = new URLSearchParams(window.location.search).get(
      "tokenHash"
    );
    if (!tokenHash) {
      toast.error("Token hash not found");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
      return;
    }

    setAuthState("signin");
    toast.success("Password reset successful!");
  };

  return {
    errors,
    setErrors,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    handleResetPassword,
  };
}
