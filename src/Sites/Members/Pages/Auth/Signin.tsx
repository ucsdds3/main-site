import { FaEnvelope, FaLock } from "react-icons/fa";

import Button from "src/Shared/Components/Button";
import Page from "src/Shared/Page/Page";

import { Input } from "../../Components/Input";
import { useAuthStore } from "../../Hooks/useAuthStore";
import { useSignIn } from "./Hooks/useSignIn";

const Signin = () => {
  const { setAuthState } = useAuthStore();
  const { data, setData, handleSignin } = useSignIn();

  return (
    <Page>
      <form
        className="flex flex-col items-center justify-center w-full flex-1 py-20"
        onSubmit={handleSignin}
      >
        <h1 className="text-fluid-page-hero text-center">Welcome Back!</h1>

        <div className="my-8 flex flex-col items-center justify-center">
          <div className="flex flex-col gap-6">
            <Input
              label="UCSD Email"
              type="email"
              placeholder="jdoe@ucsd.edu"
              icon={<FaEnvelope className="mr-2 shrink-0 text-(--obs-text-muted)" />}
              value={data.email}
              setValue={(value: string) => setData({ ...data, email: value })}
            />
            <Input
              label="Password"
              type="password"
              placeholder="***************"
              icon={<FaLock className="mr-2 shrink-0 text-(--obs-text-muted)" />}
              value={data.password}
              setValue={(value: string) => setData({ ...data, password: value })}
            />
          </div>

          <div className="mt-2 flex w-full max-w-[300px] items-baseline justify-between gap-4 text-sm">
            <a onClick={() => setAuthState("forgot-password")} className="obs-link">
              Forgot Password?
            </a>
            <a onClick={() => setAuthState("signup")} className="obs-link">
              Sign Up
            </a>
          </div>
        </div>

        <Button btnClass="text-[clamp(1rem,1vw,1.5rem)]" onClick={() => {}} type="submit">
          Login
        </Button>
      </form>
    </Page>
  );
};

export default Signin;
