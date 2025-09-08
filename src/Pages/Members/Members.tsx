import { useEffect } from "react";
import { Route, Routes } from "react-router-dom"
import { useSiteHandler } from "../../Hooks/useSiteHandler";
import { useAuthStore } from "../../Hooks/Auth/useAuthStore";
import Auth from "./Auth/Auth";

const Members = () => {
  const { authState } = useAuthStore();
  const { navigate } = useSiteHandler();
  
  useEffect(() => {
    if (authState != "authenticated") navigate({ pathname: "/auth" });
  }, [authState]);
  
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
    </Routes>
  )
}

export default Members