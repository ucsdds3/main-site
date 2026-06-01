import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { NavigateProps } from "../Utils/types";

export function useSiteHandler() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const hostname = window.location.hostname;
  const parts = hostname.split(".");
  const isLocalHostname =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);

  let subdomain = new URLSearchParams(search).get("subdomain") || "main";
  if (!isLocalHostname && !hostname.includes("vercel.app") && parts.length > 2) {
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

  const navigateTo = ({ pathname, subdomain, hash, nextURL }: NavigateProps) => {
    const hostname = window.location.hostname;
    const rawPath = pathname || window.location.pathname;
    const [pathOnly, pathSearch] = rawPath.includes("?") ? rawPath.split("?", 2) : [rawPath, ""];
    const path = pathOnly;
    const search = pathSearch ? `?${pathSearch}` : window.location.search || "";
    const parts = hostname.split(".");
    const isLocalHostname =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
    const isProdSubdomain =
      !isLocalHostname && !hostname.includes("vercel.app") && parts.length > 2;
    const currentSubdomain = isProdSubdomain ? (parts[0] === "www" ? "main" : parts[0]) : null;

    const searchParams = new URLSearchParams(search);
    if (nextURL) searchParams.set("next", nextURL);
    else searchParams.delete("next");
    if (isProdSubdomain) searchParams.delete("subdomain");
    else if (subdomain) searchParams.set("subdomain", subdomain);
    const query = searchParams.toString();
    const pathWithSearch = query ? `${path}?${query}` : path;

    if (subdomain && (!isProdSubdomain || currentSubdomain !== subdomain)) {
      if (isLocalHostname || hostname.includes("vercel.app")) {
        navigate(pathWithSearch);
      } else {
        window.location.href = `https://${subdomain}.ds3atucsd.com${path}${query ? `?${query}` : ""}`;
      }
    } else {
      navigate(pathWithSearch);
    }

    if (hash) {
      const id = hash.startsWith("#") ? hash.slice(1) : hash;
      const scrollToTarget = () => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: "smooth" });
      };
      setTimeout(scrollToTarget, 100);
      setTimeout(scrollToTarget, 400);
    }
  };

  return { subdomain, navigate: navigateTo };
}
