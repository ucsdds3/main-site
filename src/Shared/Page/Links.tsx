import { useAuthStore } from "src/Sites/Members/Hooks/useAuthStore";
import { useSiteHandler } from "src/Hooks/useSiteHandler";

import navData from "./Data/navbar.json";
import NavItem from "./NavItem";
import Avatar from "./Avatar";

const Links = ({ menuOpen }: { menuOpen: boolean }) => {
  const { authState, adminLevel } = useAuthStore();
  const { subdomain, navigate } = useSiteHandler();
  const links = navData[subdomain as keyof typeof navData] || navData.main;

  const isMembers = subdomain === "members";
  const isAuthed  = authState === "authenticated";

  return (
    <div
      className={`w-full lg:w-auto flex-col items-stretch lg:items-center lg:flex lg:flex-row gap-4 lg:gap-8 ${
        menuOpen ? "flex" : "hidden"
      }`}
      style={{ paddingTop: menuOpen ? "0.5rem" : 0 }}
    >
      {Object.entries(links).map(([label, data], index) => (
        <NavItem key={index} label={label} data={data as string | Record<string, string>} />
      ))}

      {isMembers && isAuthed && adminLevel !== "Member" && (
        <NavItem label="Admin" data="/admin" />
      )}

      {isMembers && (
        <NavItem label="Main Site" data={{ pathname: "/", subdomain: "main" }} />
      )}

      {(!isMembers || !isAuthed) ? (
        <button
          type="button"
          onClick={() =>
            navigate({ pathname: "/", subdomain: subdomain === "main" ? "members" : "main" })
          }
          className="font-mono whitespace-nowrap rounded-full border border-[rgba(25,181,202,0.45)] bg-[rgba(25,181,202,0.1)] px-[1.4rem] py-[0.55rem] text-[0.68rem] font-medium uppercase tracking-[0.18em] text-[#19B5CA] transition-all duration-200 cursor-pointer"
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(25,181,202,0.2)"
            e.currentTarget.style.borderColor = "rgba(25,181,202,0.75)"
            e.currentTarget.style.boxShadow = "0 0 20px rgba(25,181,202,0.2)"
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(25,181,202,0.1)"
            e.currentTarget.style.borderColor = "rgba(25,181,202,0.45)"
            e.currentTarget.style.boxShadow = "none"
          }}
        >
          {subdomain === "main" ? isAuthed ? "Members" : "Sign In" : "Main Site"}
        </button>
      ) : (
        <Avatar />
      )}
    </div>
  );
};

export default Links;