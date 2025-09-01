import Signin from "./Signin";
import Signup from "./Signup";
import { useState } from "react";

const Auth = () => {
  const [authState, setAuthState] = useState("signin");

  if (authState == "signin") return <Signin setAuthState={setAuthState} />;
  if (authState == "signup") return <Signup setAuthState={setAuthState} />;
}

export default Auth