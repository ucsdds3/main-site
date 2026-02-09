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
  const redirectTo = new URLSearchParams(search).get("redirect");
  const safeRedirect =
    redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/";

  useEffect(() => {
    if (authState == "authenticated") {
      navigate({ pathname: safeRedirect, subdomain: "members" });
    }
  }, [authState, safeRedirect, navigate]);

  if (authState == "signin") return <Signin />;
  if (authState == "signup") return <Signup />;
  if (authState == "forgot-password") return <ForgotPassword />;
  if (authState == "reset-password") return <ResetPassword />;
};

export default Auth;
