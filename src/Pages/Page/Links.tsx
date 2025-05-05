import { useSiteHandler } from "../../Hooks/useSiteHandler";
import navData from "../../Assets/Data/navbar.json";
import NavItem from "./NavItem";
import { Link } from "react-router";

const Links = ({ menuOpen }: { menuOpen: boolean }) => {
  const isConsulting = useSiteHandler();
  const links = isConsulting ? navData.consulting : navData.main;
  const typographyClasses = "font-quicksand font-normal tracking-[0px]";

  return (
    <div
      className={`w-full lg:w-auto items-center flex-col lg:flex lg:flex-row gap-6 text-lg ${
        menuOpen ? "flex" : "hidden"
      } ${typographyClasses}`}
    >
      {Object.entries(links).map(([label, data], index) => (
        <NavItem key={index} label={label} data={data} />
      ))}
      <Link
        to={isConsulting ? { pathname: "/", search: "site=main" } : "/join-us"}
        className={`bg-(--color-primary) px-4 py-2 hover:brightness-110 cursor-pointer rounded-full text-center ${typographyClasses} font-medium w-full sm:w-auto min-w-[120px] uppercase`}
      >
        {isConsulting ? "Main Site" : "Join Us"}
      </Link>
    </div>
  );
};

export default Links;
