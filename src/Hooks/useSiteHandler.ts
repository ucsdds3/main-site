import { useEffect } from "react";
import { useLocation } from "react-router";

export function useSiteHandler() {
  const { search } = useLocation();
  const isConsulting = new URLSearchParams(search).get("site") === "consulting";

  useEffect(() => {
    document.title = isConsulting ? "DS3 Consulting" : "DS3 @ UCSD";
  }, [isConsulting]);

  return isConsulting;
}