// import { FaLink } from "react-icons/fa6";
import { IoIosArrowUp } from "react-icons/io";
import { useSiteHandler } from "../../Hooks/useSiteHandler";
import { NavigateProps } from "../../Utils/types";

interface NavItemProps {
  label: string;
  data?: string | Record<string, string>;
}

const NavItem = ({ label, data }: NavItemProps) => {
  const { navigate } = useSiteHandler();

  const parseData = (data: string | Record<string, string>) => {
    if (typeof data === "string") return data[0] == "/" ? { pathname: data } : { hash: data };
    return data as NavigateProps;
  };

  return typeof data === "string" || data?.hash || data?.target ? (
    <button
      onClick={() => navigate(parseData(data))}
      className="hover:text-(--color-primary) relative flex items-center gap-1 group cursor-pointer"
    >
      {label}
      {/* {label == "Consulting" && <FaLink className="opacity-0 group-hover:opacity-100 " />} */}
    </button>
  ) : (
    <div className="relative group w-full lg:w-auto lg:dropdown">
      <div
        role="button"
        tabIndex={0}
        className="flex justify-center items-center gap-2 cursor-pointer hover:text-(--color-primary) transition focus:text-(--color-primary) duration-300"
      >
        <span>{label}</span>
        <IoIosArrowUp className="transition-transform duration-300 group-focus-within:rotate-180" />
      </div>

      <ul className="hidden group-focus-within:flex group-hover:flex flex-col gap-3 lg:gap-0 dropdown-content lg:menu bg-base-100 lg:w-52 z-10 p-2 shadow-sm group-focus-within:border-t border-(--color-primary) lg:border lg:border-white mt-2 lg:rounded-lg text-center">
        {Object.entries(data as object).map(([label, pathname]) => (
          <li key={label}>
            <button
              onClick={() => navigate({ pathname })}
              className="hover:text-(--color-primary) text-base"
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NavItem;
