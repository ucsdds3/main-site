import { FaLock, FaUser } from "react-icons/fa";

import Button from "../../../Components/Button";
import Input from "../../../Components/Input";
import Page from "../../../Components/Page/Page";

const Signin = ({ setAuthState }: { setAuthState: (state: string) => void }) => {

  return (
    <Page>
      <form className="flex flex-col items-center justify-center w-full flex-1 py-20">
        <h1 className="text-center hero-text-shadow text-[clamp(2.5rem,14vw,4.5rem)]">
          Welcome Back!
        </h1>

        <div className="flex flex-col items-center justify-center my-8">
          <div className="flex flex-col gap-6">
            <Input
              label="UCSD Email"
              type="email"
              placeholder="jdoe@ucsd.edu"
              icon={<FaUser className="mr-2" />}
            />
            <Input
              label="Password"
              type="password"
              placeholder="***************"
              icon={<FaLock className="mr-2" />}
            />
          </div>

          <div className="flex items-center justify-between w-full text-lg mt-2">
            <a
              onClick={() => setAuthState("forgot-password")}
              className="text-blue-400 hover:underline cursor-pointer"
            >
              Forgot Password?
            </a>
            <a
              onClick={() => setAuthState("signup")}
              className="text-blue-400 hover:underline cursor-pointer"
            >
              Sign Up
            </a>
          </div>
        </div>

        <Button btnClass="text-[clamp(0.8rem,1vw,1.5rem)]" onClick={() => {}}>
          Login
        </Button>
      </form>
    </Page>
  );
};

export default Signin;
