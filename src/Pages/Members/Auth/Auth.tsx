import { useAuthStore } from "../../../Hooks/Auth/useAuthStore";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import Signin from "./Signin";
import Signup from "./Signup";

const Auth = () => {
  const { authState } = useAuthStore();
  
  if (authState == "signin") return <Signin />;
  if (authState == "signup") return <Signup />;
  if (authState == "forgot-password") return <ForgotPassword />;
  if (authState == "reset-password") return <ResetPassword />;
  if (authState == "authenticated") return; 
}

export default Auth