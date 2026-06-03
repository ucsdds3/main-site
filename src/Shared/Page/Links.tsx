import { useAuthStore } from "src/Sites/Members/Hooks/useAuthStore";
import { useSiteHandler } from "src/Hooks/useSiteHandler";
import { twMerge } from "src/Utils/cn";

import navData from "./Data/navbar.json";
import NavItem from "./NavItem";
import Avatar from "./Avatar";

const Links = ({ menuOpen }: { menuOpen: boolean }) => {
  const { authState, adminLevel } = useAuthStore();
  const { subdomain, navigate } = useSiteHandler();
  const links = navData[subdomain as keyof typeof navData] || navData.main;

  const isMembers = subdomain === "members";
  const isAuthed = authState === "authenticated";

  return (
    <div
      className={twMerge(
        "w-full flex-col items-stretch gap-4 lg:w-auto lg:flex lg:flex-row lg:items-center lg:gap-8",
        menuOpen ? "flex pt-2" : "hidden pt-0"
      )}
    >
      {Object.entries(links).map(([label, data], index) => (
        <NavItem key={index} label={label} data={data as string | Record<string, string>} />
      ))}

      {isMembers && isAuthed && adminLevel !== "Member" && (
        <NavItem
          label="Admin"
          data={{
            Dashboard: "/admin",
            Insights: "/admin/insights",
            "Where We Are": "/admin/where-we-are",
          }}
        />
      )}

      {isMembers && (
        <NavItem label="Main Site" data={{ pathname: "/", subdomain: "main" }} />
      )}

      {!isMembers || !isAuthed ? (
        <button
          type="button"
          onClick={() =>
            navigate({ pathname: "/", subdomain: subdomain === "main" ? "members" : "main" })
          }
          className="font-mono whitespace-nowrap rounded-full border border-[rgba(25,181,202,0.45)] bg-[rgba(25,181,202,0.1)] px-[1.4rem] py-[0.55rem] text-[0.68rem] font-medium uppercase tracking-[0.18em] text-[#19B5CA] transition-all duration-200 cursor-pointer"
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(25,181,202,0.2)";
            e.currentTarget.style.borderColor = "rgba(25,181,202,0.75)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(25,181,202,0.2)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(25,181,202,0.1)";
            e.currentTarget.style.borderColor = "rgba(25,181,202,0.45)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {subdomain === "main" ? (isAuthed ? "Members" : "Sign In") : "Main Site"}
        </button>
      ) : (
        <Avatar />
      )}
    </div>
  );
};

export default Links;