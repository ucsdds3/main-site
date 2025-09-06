import { useState } from "react";
import toast from "react-hot-toast";
import { FaEnvelope } from "react-icons/fa";

import Page from "../../../Components/Page/Page";
import Input from "../../../Components/Input";
import Button from "../../../Components/Button";
import { supabase } from "../../../Utils/supabase";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const href = window.location.href;
    const search = new URLSearchParams(window.location.search);
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${href}${search && "&"}authState=reset-password`,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    console.log(data);
    toast.success("Reset link sent to email");
  };

  return (
    <Page>
      <form
        className="flex flex-col items-center justify-center w-full flex-1 py-20"
        onSubmit={handleForgotPassword}
      >
        <h1 className="text-center hero-text-shadow text-[clamp(2.5rem,14vw,4.5rem)]">
          Forgot Password?
        </h1>
        <p className="text-center text-xl">Enter your email to receive a reset link</p>

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

        <Button btnClass="text-[clamp(1rem,1vw,1.5rem)]" onClick={() => {}} type="submit">
          Send Reset Link
        </Button>
      </form>
    </Page>
  );
};

export default ForgotPassword;
