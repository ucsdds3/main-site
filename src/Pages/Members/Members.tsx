import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useSiteHandler } from "../../Hooks/useSiteHandler";
import { useAuthStore } from "../../Hooks/Members/Auth/useAuthStore";
import Auth from "./Auth/Auth";
import Home from "./Home/Home";
import EventsList from "../../Components/Events/EventsList";
import Profile from "./Profile/Profile";
import Store from "./Store/Store";
import Admin from "./Admin/Admin";

const Members = () => {
  const { authState, adminLevel } = useAuthStore();
  const { navigate } = useSiteHandler();
  const location = useLocation();

  useEffect(() => {
    if (authState != "authenticated") navigate({ pathname: "/auth" });
    else if (adminLevel == null && location.pathname.includes("admin")) navigate({ pathname: "/" });
    console.log(authState, "MEMBERS");
  }, [authState, adminLevel]);

  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/events" element={<EventsList />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/store" element={<Store />} />
    </Routes>
  );
};

export default Members;
