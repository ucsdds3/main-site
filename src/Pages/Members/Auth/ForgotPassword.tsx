import { FaEnvelope } from "react-icons/fa";
import Page from "../../../Components/Page/Page";
import Input from "../../../Components/Input";
import Button from "../../../Components/Button";
import { useForgotPassword } from "../../../Hooks/Auth/useForgotPassword";
import { useAuthStore } from "../../../Hooks/Auth/useAuthStore";

const ForgotPassword = () => {
  const { setAuthState } = useAuthStore();
  const { email, setEmail, handleForgotPassword } = useForgotPassword();

  return (
    <Page>
      <form
        className="flex flex-col items-center justify-center w-full flex-1 py-20"
        onSubmit={handleForgotPassword}
      >
        <h1 className="text-center hero-text-shadow text-[clamp(2.5rem,14vw,4.5rem)]">
          Forgot Password?
        </h1>
        <p className="text-center text-xl">
          Enter your email to receive a reset link
        </p>

        <div className="flex flex-col items-center justify-center my-4">
          <Input
            label="Email"
            type="email"
            placeholder="Email"
            value={email}
            setValue={setEmail}
            icon={<FaEnvelope className="mr-2" />}
          />
        </div>

        <Button
          btnClass="text-[clamp(1rem,1vw,1.5rem)]"
          onClick={() => {}}
          type="submit"
        >
          Send Reset Link
        </Button>

        <p className="text-center text-lg">
          Back to
          <a
            onClick={() => setAuthState("signin")}
            className="text-blue-400 hover:underline cursor-pointer ml-1"
          >
            Sign In
          </a>
        </p>
      </form>
    </Page>
  );
};

export default ForgotPassword;
