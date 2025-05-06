import { IoIosArrowUp } from "react-icons/io";
import { HashLink } from "react-router-hash-link";
import { setSite } from "../../Utils/functions.tsx";
import { Link } from "react-router";

interface NavItemProps {
  label: string;
  data?: string | Record<string, string>;
}

const NavItem = ({ label, data }: NavItemProps) => {
  if (typeof data === "string") {
    return (
      <Link to={data} className="hover:text-(--color-primary)">
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
      className="hover:text-(--color-primary)"
    >
      {label}
    </HashLink>
  ) : (
    <div className="relative group w-full lg:w-auto lg:dropdown">
      <div
        role="button"
        tabIndex={0}
        className="flex justify-center items-center gap-2 cursor-pointer hover:text-(--color-primary) focus:text-(--color-primary) duration-300"
      >
        <span>{label}</span>
        <IoIosArrowUp className="transition-transform duration-300 group-focus-within:rotate-180" />
      </div>

      <ul className="hidden group-focus-within:flex group-hover:flex flex-col gap-3 lg:gap-0 dropdown-content lg:menu bg-base-100 lg:w-52 z-10 p-2 shadow-sm group-focus-within:border-t border-(--color-primary) lg:border lg:border-white mt-2 lg:rounded-lg text-center">
        {Object.entries(data as object).map(([label, path]) => (
          <li key={label}>
            <Link
              to={path}
              className="hover:text-(--color-primary) text-base"
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
