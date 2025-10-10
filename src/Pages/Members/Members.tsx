import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useSiteHandler } from "../../Hooks/useSiteHandler";
import { useAuthStore } from "../../Hooks/Members/Auth/useAuthStore";
import Auth from "./Auth/Auth";
import Home from "./Home/Home";
import EventsList from "./Events/EventsList";
import Profile from "./Profile/Profile";
import Store from "./Store/Store";

const Members = () => {
  const { authState } = useAuthStore();
  const { navigate } = useSiteHandler();

  useEffect(() => {
    if (authState != "authenticated") navigate({ pathname: "/auth" });
    console.log(authState, "MEMBERS");
  }, [authState]);

  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/events" element={<EventsList />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/store" element={<Store />} />
    </Routes>
  );
};

export default Members;
