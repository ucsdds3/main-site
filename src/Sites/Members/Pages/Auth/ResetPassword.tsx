import { FaLock } from "react-icons/fa";

import Page from "src/Shared/Page/Page";
import Button from "src/Shared/Components/Button";

import { Input } from "../../Components/Input";
import { useAuthStore } from "../../Hooks/useAuthStore";
import { useResetPassword } from "./Hooks/useResetPassword";

const ResetPassword = () => {
  const { setAuthState } = useAuthStore();
  const {
    errors,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    handleResetPassword,
    linkExpired,
  } = useResetPassword();

  if (linkExpired) {
    return (
      <Page>
        <div className="flex flex-col items-center justify-center w-full flex-1 py-20">
          <h1 className="text-center hero-text-shadow text-[clamp(2.5rem,14vw,4.5rem)]">
            Reset Password
          </h1>
          <p className="text-center text-xl mb-6">
            Your reset link has expired. Please request a new one.
          </p>
          <Button
            btnClass="text-[clamp(1rem,1vw,1.5rem)]"
            onClick={() => setAuthState("forgot-password")}
          >
            Resend Reset Link
          </Button>
        </div>
      </Page>
    );
  }

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
