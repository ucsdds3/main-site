import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "../../Hooks/useAuthStore";
import { useSiteHandler } from "../../../../Hooks/useSiteHandler";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import Signin from "./Signin";
import Signup from "./Signup";

const Auth = () => {
  const { authState } = useAuthStore();
  const { navigate } = useSiteHandler();
  const { search } = useLocation();
  const nextURL = new URLSearchParams(search).get("next");
  const safeNextURL =
    nextURL && nextURL.startsWith("/") && !nextURL.startsWith("//") ? nextURL : "/";

  useEffect(() => {
    if (authState == "authenticated") {
      navigate({ pathname: safeNextURL, subdomain: "members" });
    }
  }, [authState, safeNextURL, navigate]);

  if (authState == "signin") return <Signin />;
  if (authState == "signup") return <Signup />;
  if (authState == "forgot-password") return <ForgotPassword />;
  if (authState == "reset-password") return <ResetPassword />;
};

export default Auth;
