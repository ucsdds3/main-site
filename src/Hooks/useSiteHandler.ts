import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { NavigateProps } from "../Utils/types";

/** Host labels that map to real per-subdomain production sites (not staging aliases). */
const PROD_SITE_HOST_LABELS = new Set(["members", "www"]);

function isLocalHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)
  );
}

/** True when hostname should use members.ds3atucsd.com-style routing (not ?subdomain=). */
function hostnameUsesProdSubdomain(hostname: string): boolean {
  if (isLocalHostname(hostname) || hostname.includes("vercel.app")) return false;
  const parts = hostname.split(".");
  if (parts.length <= 2) return false;
  return PROD_SITE_HOST_LABELS.has(parts[0]);
}

/** `main` | `members` when the host label is a known prod site; otherwise null (use query param). */
function subdomainFromProdHostname(hostname: string): string | null {
  const parts = hostname.split(".");
  if (parts.length <= 2) return null;
  const label = parts[0];
  if (label === "www") return "main";
  if (label === "members") return "members";
  return null;
}

export function useSiteHandler() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const hostname = window.location.hostname;

  let subdomain = new URLSearchParams(search).get("subdomain") || "main";
  const fromHost = subdomainFromProdHostname(hostname);
  if (fromHost !== null) {
    subdomain = fromHost;
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
    const isProdSubdomain = hostnameUsesProdSubdomain(hostname);
    const currentSubdomain = isProdSubdomain ? subdomainFromProdHostname(hostname) : null;

    const searchParams = new URLSearchParams(search);
    if (nextURL) searchParams.set("next", nextURL);
    else searchParams.delete("next");
    if (isProdSubdomain) searchParams.delete("subdomain");
    else if (subdomain) searchParams.set("subdomain", subdomain);
    const query = searchParams.toString();
    const pathWithSearch = query ? `${path}?${query}` : path;

    if (subdomain && (!isProdSubdomain || currentSubdomain !== subdomain)) {
      if (isLocalHostname(hostname) || hostname.includes("vercel.app") || !isProdSubdomain) {
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
