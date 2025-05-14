import { IoIosArrowUp } from "react-icons/io";
import { HashLink } from "react-router-hash-link";
import { setSite } from "../../Utils/functions.tsx";
import { Link } from "react-router";
import { FaLink } from "react-icons/fa6";
interface NavItemProps {
  label: string;
  data?: string | Record<string, string>;
}

const NavItem = ({ label, data }: NavItemProps) => {
  if (typeof data === "string") {
    return (
      <Link to={data} className="hover:text-(--color-primary) duration-150">
        {label}
      </Link>
    );
  }

  return data?.search ? (
    <HashLink
      to={data}
      smooth
      target={data.target || "_self"}
      onClick={() => setSite("consulting")}
      className="hover:text-(--color-primary) relative flex items-center gap-1 group"
    >
      {label}
      {label == "Consulting" && <FaLink className="opacity-0 group-hover:opacity-100 " />}
    </HashLink>
  ) : (
    <div className="relative group w-full lg:w-auto lg:dropdown">
      <div
        role="button"
        tabIndex={0}
        className="flex justify-center items-center gap-2 cursor-pointer hover:text-(--color-primary) transition duration-150 focus:text-(--color-primary) duration-300"
      >
        <span>{label}</span>
        <IoIosArrowUp className="transition-transform duration-300 group-focus-within:rotate-180" />
      </div>

      <ul className="hidden group-focus-within:flex group-hover:flex flex-col gap-3 lg:gap-0 dropdown-content lg:menu bg-base-100 lg:w-52 z-10 p-2 shadow-sm group-focus-within:border-t border-(--color-primary) lg:border lg:border-white mt-2 lg:rounded-lg text-center">
        {Object.entries(data as object).map(([label, path]) => (
          <li key={label}>
            <Link
              to={path}
              className="hover:text-(--color-primary) text-xl text-base"
              onMouseDown={(e) => e.preventDefault()}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NavItem;
