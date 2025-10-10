import { useAuthStore } from "../../Hooks/Members/Auth/useAuthStore";
import { useSiteHandler } from "../../Hooks/useSiteHandler";
import navData from "../../Assets/Data/navbar.json";
import NavItem from "./NavItem";
import Avatar from "./Avatar";

const Links = ({ menuOpen }: { menuOpen: boolean }) => {
  const { authState } = useAuthStore();
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
      {subdomain == "main" || authState == "signin" ? (
        <button
          onClick={authState != "signin" ? () => navigate({ pathname: "/join-us" }) : () => navigate({ pathname: "/", subdomain: "main" })}
          className={`bg-(--color-primary) px-4 pb-2 pt-1 hover:brightness-110 cursor-pointer rounded-full text-center ${typographyClasses} font-medium w-full sm:w-auto min-w-[120px] uppercase`}
        >
          {authState != "signin" ? "Join Us" : "Main Site"}
        </button>
      ) : (
        <Avatar />
      )}
    </div>
  );
};

export default Links;
