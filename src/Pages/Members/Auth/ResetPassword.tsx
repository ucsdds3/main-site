import z from "zod";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaLock } from "react-icons/fa";

import Page from "../../../Components/Page/Page";
import Input from "../../../Components/Input";
import Button from "../../../Components/Button";
import { supabase } from "../../../Utils/supabase";
import { useAuthStore } from "../../../Hooks/useAuth";

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

const ResetPassword = () => {
  const [errors, setErrors] = useState<string>("");
  const { setAuthState } = useAuthStore();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = resetPasswordSchema.safeParse({ password, confirmPassword });

    if (!result.success) {
      const errors = result.error.issues.map((issue) => issue.message).join("\n");
      toast.error("Please fix the following errors:\n" + errors);
      console.log(errors);
      setErrors(errors);
      return;
    }

    const tokenHash = new URLSearchParams(window.location.search).get("tokenHash");
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

  return (
    <Page>
      <form
        className="flex flex-col items-center justify-center w-full flex-1 py-20"
        onSubmit={handleResetPassword}
      >
        <h1 className="text-center hero-text-shadow text-[clamp(2.5rem,14vw,4.5rem)]">
          Reset Password
        </h1>
        <p className="text-center text-xl">Enter your new password</p>

        <div className="flex flex-col items-center justify-center my-4 gap-4">
          <Input
            label="New Password"
            type="password"
            error={errors.toLowerCase().includes("password")}
            placeholder="New Password"
            value={password}
            setValue={setPassword}
            icon={<FaLock className="mr-2" />}
          />

          <Input
            label="Confirm Password"
            type="password"
            error={errors.toLowerCase().includes("password")}
            placeholder="Confirm Password"
            value={confirmPassword}
            setValue={setConfirmPassword}
            icon={<FaLock className="mr-2" />}
          />
        </div>

        <Button btnClass="text-[clamp(1rem,1vw,1.5rem)]" onClick={() => {}} type="submit">
          Reset Password
        </Button>
      </form>
    </Page>
  );
};

export default ResetPassword;
