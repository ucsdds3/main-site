import { useEffect } from "react";
import { Route, Routes } from "react-router-dom"
import { useSiteHandler } from "../../Hooks/useSiteHandler";
import Auth from "./Auth/Auth";

const Members = () => {
  const isAuth = false;
  const { navigate } = useSiteHandler();
  
  useEffect(() => {
    if (!isAuth) navigate({ pathname: "/auth" });
  }, [isAuth, navigate]);
  
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
    </Routes>
  )
}

export default Members