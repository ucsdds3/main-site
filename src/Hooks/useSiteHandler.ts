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

  const navigateTo = ({ pathname, subdomain, hash, redirect }: NavigateProps) => {
    const hostname = window.location.hostname;
    const path = pathname || window.location.pathname;
    const search = window.location.search || "";
    const parts = hostname.split(".");
    const isProdSubdomain =
      !hostname.includes("localhost") && !hostname.includes("vercel.app") && parts.length > 2;
    const currentSubdomain = isProdSubdomain ? (parts[0] === "www" ? "main" : parts[0]) : null;

    const searchParams = new URLSearchParams(search);
    if (redirect) searchParams.set("redirect", redirect);
    if (isProdSubdomain) searchParams.delete("subdomain");
    else if (subdomain) searchParams.set("subdomain", subdomain);
    const query = searchParams.toString();
    const pathWithSearch = query ? `${path}?${query}` : path;

    if (subdomain && (!isProdSubdomain || currentSubdomain !== subdomain)) {
      if (hostname === "localhost" || hostname.includes("vercel.app")) {
        navigate(pathWithSearch);
      } else {
        window.location.href = `https://${subdomain}.ds3atucsd.com${path}${query ? `?${query}` : ""}`;
      }
    } else {
      navigate(pathWithSearch);
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
