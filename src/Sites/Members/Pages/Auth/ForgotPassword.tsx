import { FaEnvelope } from "react-icons/fa";

import Page from "src/Shared/Page/Page";
import Button from "src/Shared/Components/Button";

import { Input } from "../../Components/Input";
import { useAuthStore } from "../../Hooks/useAuthStore";
import { useForgotPassword } from "./Hooks/useForgotPassword";

const ForgotPassword = () => {
  const { setAuthState } = useAuthStore();
  const { email, setEmail, handleForgotPassword } = useForgotPassword();

  return (
    <Page>
      <form
        className="flex flex-col items-center justify-center w-full flex-1 py-20"
        onSubmit={handleForgotPassword}
      >
        <h1 className="text-fluid-page-hero text-center">Forgot Password?</h1>
        <p className="text-center fl-text-lg/xl text-(--obs-text-muted)">
          Enter your email to receive a reset link
        </p>

        <div className="flex flex-col items-center justify-center my-4">
          <Input
            label="Email"
            type="email"
            placeholder="Email"
            value={email}
            setValue={setEmail}
            icon={<FaEnvelope className="mr-2 shrink-0 text-(--obs-text-muted)" />}
          />
        </div>

        <Button btnClass="text-[clamp(1rem,1vw,1.5rem)]" onClick={() => {}} type="submit">
          Send Reset Link
        </Button>

        <p className="text-center fl-text-base/lg text-(--obs-text-muted)">
          Back to{" "}
          <a onClick={() => setAuthState("signin")} className="obs-link">
            Sign In
          </a>
        </p>
      </form>
    </Page>
  );
};

export default ForgotPassword;
