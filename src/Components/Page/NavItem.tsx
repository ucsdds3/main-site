import { IoIosArrowUp } from "react-icons/io";
import { Link } from "react-router";

interface NavItemProps {
  label: string;
  data?:
    | string
    | {
        [key: string]: string;
      };
}

const NavItem = ({ label, data }: NavItemProps) => {
  return typeof data === "string" ? (
    <Link to={data!} className="hover:text-(--color-primary)">
      {label}
    </Link>
  ) : (
    <div className="relative group w-full md:w-auto md:dropdown">
      <div
        tabIndex={0}
        role="button"
        className="flex justify-center items-center gap-2 cursor-pointer hover:text-(--color-primary) focus:text-(--color-primary) duration-300"
      >
        <span>{label}</span>
        <IoIosArrowUp className="transition-transform duration-300 group-focus-within:rotate-180" />
      </div>

      <ul className="hidden group-focus-within:flex group-hover:flex flex-col gap-3 md:gap-0 dropdown-content md:menu bg-base-100 md:w-52 z-10 p-2 shadow-sm group-focus-within:border-t border-(--color-primary) md:border md:border-white mt-2 md:rounded-lg text-center">
        {Object.entries(data as object).map(([label, path]) => (
          <li key={label}>
            <Link to={path} className="hover:text-(--color-primary) text-base">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NavItem;
