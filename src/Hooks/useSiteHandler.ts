import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { NavigateProps } from "../Utils/types";

export function useSiteHandler() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const hostname = window.location.hostname;
  const parts = hostname.split(".");

  let subdomain = new URLSearchParams(search).get("subdomain") || "main";
  if (!hostname.includes("vercel.app") && parts.length > 2) {
    subdomain = parts[0] === "www" ? "main" : parts[0];
  }

  useEffect(() => {
    document.title =
      subdomain == "consulting"
        ? "DS3 Consulting"
        : subdomain == "members"
        ? "DS3 Members"
        : "DS3 @ UCSD";
  }, [subdomain]);

  const navigateTo = ({ pathname, subdomain, hash }: NavigateProps) => {
    const hostname = window.location.hostname;
    const path = pathname || window.location.pathname;
    const search = window.location.search || "";
    
    if (subdomain) {
      if (hostname === "localhost" || hostname.includes("vercel.app")) {
        const searchParams = new URLSearchParams(search);
        searchParams.set("subdomain", subdomain);
        navigate(`${path}?${searchParams.toString()}`);
      } else {
        window.location.href = `https://${subdomain}.ds3atucsd.com${path}${search}`;
      }
    } else {
      navigate(`${path}${search}`);
    }

    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) element.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return { subdomain, navigate: navigateTo };
}
