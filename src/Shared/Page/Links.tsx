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
      className={`w-full lg:w-auto items-center flex-col lg:flex lg:flex-row gap-6 lg:gap-8 ${
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

      {(!isMembers || !isAuthed) ? (
        <button
          onClick={() =>
            navigate({ pathname: "/", subdomain: subdomain === "main" ? "members" : "main" })
          }
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: "0.68rem",
            fontWeight: 500,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            padding: "0.55rem 1.4rem",
            borderRadius: "9999px",
            border: "1px solid rgba(25,181,202,0.45)",
            background: "rgba(25,181,202,0.1)",
            color: "#19B5CA",
            cursor: "pointer",
            transition: "all 0.2s ease",
            whiteSpace: "nowrap",
          }}
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
          {subdomain === "main" ? "Login / Sign up" : "Main Site"}
        </button>
      ) : (
        <Avatar />
      )}
    </div>
  );
};

export default Links;