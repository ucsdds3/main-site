import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useSiteHandler } from "../../Hooks/useSiteHandler";
import { useAuthStore } from "../../Hooks/Auth/useAuthStore";
import Auth from "./Auth/Auth";
import Home from "./Home/Home";
import EventsList from "./Events/EventsList";

const Members = () => {
  const { authState } = useAuthStore();
  const { navigate } = useSiteHandler();

  useEffect(() => {
    if (authState != "authenticated") navigate({ pathname: "/auth" });
  }, [authState]);

  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/events" element={<EventsList />} />
    </Routes>
  );
};

export default Members;
