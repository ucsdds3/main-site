import { useState } from "react";
import toast from "react-hot-toast";
import { FaEnvelope, FaLock } from "react-icons/fa";

import Button from "../../../Components/Button";
import Input from "../../../Components/Input";
import Page from "../../../Components/Page/Page";
import { supabase } from "../../../Utils/supabase";
import { useAuthStore } from "../../../Hooks/useAuth";
import { useSiteHandler } from "../../../Hooks/useSiteHandler";

const Signin = () => {
  const { setAuthState, setUser } = useAuthStore();
  const { navigate } = useSiteHandler();

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const resendVerification = async () => {
    const href = window.location.href;
    const search = new URLSearchParams(window.location.search);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: data.email,
      options: { emailRedirectTo: `${href}${search && "&"}authState=signin` },
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Verification email resent!");
  };

  const handleSignin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { data: userData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (!userData.user?.user_metadata.email_verified) {
      toast(
        <div>
          <span>Please verify your email to login.</span>
          <button
            className="underline text-blue-500 cursor-pointer"
            onClick={resendVerification}
          >
            Resend Verification Email
          </button>
        </div>
      );
      return;
    }

    if (error) {
      toast.error(error?.message);
      return;
    }

    setUser(userData.user);
    localStorage.setItem("user", JSON.stringify(userData.user));
    setAuthState("authenticated");
    navigate({ pathname: "/", subdomain: "members" });
    toast.success("Login successful!");
  };

  return (
    <Page>
      <form
        className="flex flex-col items-center justify-center w-full flex-1 py-20"
        onSubmit={handleSignin}
      >
        <h1 className="text-center hero-text-shadow text-[clamp(2.5rem,14vw,4.5rem)]">
          Welcome Back!
        </h1>

        <div className="flex flex-col items-center justify-center my-8">
          <div className="flex flex-col gap-6">
            <Input
              label="UCSD Email"
              type="email"
              placeholder="jdoe@ucsd.edu"
              icon={<FaEnvelope className="mr-2" />}
              value={data.email}
              setValue={(value: string) => setData({ ...data, email: value })}
            />
            <Input
              label="Password"
              type="password"
              placeholder="***************"
              icon={<FaLock className="mr-2" />}
              value={data.password}
              setValue={(value: string) =>
                setData({ ...data, password: value })
              }
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

        <Button
          btnClass="text-[clamp(1rem,1vw,1.5rem)]"
          onClick={() => {}}
          type="submit"
        >
          Login
        </Button>
      </form>
    </Page>
  );
};

export default Signin;
