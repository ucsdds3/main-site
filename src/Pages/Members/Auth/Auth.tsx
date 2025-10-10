import { useEffect } from "react";
import { useAuthStore } from "../../../Hooks/Members/Auth/useAuthStore";
import { useSiteHandler } from "../../../Hooks/useSiteHandler";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import Signin from "./Signin";
import Signup from "./Signup";

const Auth = () => {
  const { authState } = useAuthStore();
  const { navigate } = useSiteHandler();
  
  useEffect(() => {
    if (authState == "authenticated") {
      navigate({ pathname: "/" });
    }
  }, [authState, navigate]);

  if (authState == "signin") return <Signin />;
  if (authState == "signup") return <Signup />;
  if (authState == "forgot-password") return <ForgotPassword />;
  if (authState == "reset-password") return <ResetPassword />;
};

export default Auth;
