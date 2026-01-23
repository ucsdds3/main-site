import { useAuthStore } from "src/Hooks/Members/Auth/useAuthStore";
import { useSiteHandler } from "src/Hooks/useSiteHandler";

import navData from "./Data/navbar.json";
import NavItem from "./NavItem";
import Avatar from "./Avatar";

const Links = ({ menuOpen }: { menuOpen: boolean }) => {
  const { authState, adminLevel } = useAuthStore();
  const { subdomain, navigate } = useSiteHandler();
  const links = navData[subdomain as keyof typeof navData] || navData.main;
  const typographyClasses = "font-quicksand font-normal tracking-[0px]";

  return (
    <div
      className={`w-full lg:w-auto items-center flex-col lg:flex lg:flex-row gap-6 text-2xl ${
        menuOpen ? "flex" : "hidden"
      } ${typographyClasses}`}
    >
      {Object.entries(links).map(([label, data], index) => (
        <NavItem key={index} label={label} data={data} />
      ))}
      {subdomain == "members" && authState == "authenticated" && adminLevel != null && (
        <NavItem label={"Admin"} data={"/admin"} />
      )}
      {subdomain == "main" || authState != "authenticated" ? (
        <button
          onClick={() =>
            navigate({ pathname: "/", subdomain: subdomain == "main" ? "members" : "main" })
          }
          className={`bg-(--color-primary) px-4 pb-2 pt-1 hover:brightness-110 cursor-pointer rounded-full text-center ${typographyClasses} font-medium w-full sm:w-auto min-w-[120px] uppercase`}
        >
          {subdomain == "main" ? "Members Login" : "Main Site"}
        </button>
      ) : (
        <Avatar />
      )}
    </div>
  );
};

export default Links;
