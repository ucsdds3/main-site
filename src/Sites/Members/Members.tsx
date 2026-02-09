import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import { useSiteHandler } from "src/Hooks/useSiteHandler";
import { useAuthStore } from "src/Sites/Members/Hooks/useAuthStore";
import Events from "src/Shared/Events/Events";

import Auth from "./Pages/Auth/Auth";
import Home from "./Pages/Home/Home";
import Profile from "./Pages/Profile/Profile";
import Store from "./Pages/Store/Store";
import Admin from "./Pages/Admin/Admin";

const Members = () => {
  const { authState, adminLevel } = useAuthStore();
  const { navigate } = useSiteHandler();
  const location = useLocation();

  useEffect(() => {
    if (authState != "authenticated") {
      if (location.pathname !== "/auth") {
        const redirectPath = location.pathname;
        navigate({ pathname: "/auth", redirect: redirectPath });
      }
    } else if (adminLevel == null && location.pathname.includes("admin"))
      navigate({ pathname: "/" });
    console.log(authState, "MEMBERS");
  }, [authState, adminLevel, location.pathname]);

  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/events" element={<Events />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/store" element={<Store />} />
    </Routes>
  );
};

export default Members;
