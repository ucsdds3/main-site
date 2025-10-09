import { FaUser } from "react-icons/fa";
import { useSiteHandler } from "../../Hooks/useSiteHandler";
import { useSignOut } from "../../Hooks/Members/Auth/useSignOut";

const Avatar = () => {
  const { navigate } = useSiteHandler();
  const { handleSignOut } = useSignOut();

  const data = {
    "Main Site": { pathname: "/", subdomain: "main" },
    Profile: "/profile",
    "Sign Out": () => handleSignOut(),
  };

  return (
    <div className="relative group w-full lg:w-auto lg:dropdown lg:dropdown-end">
      <div
        role="button"
        tabIndex={0}
        className="flex justify-center items-center gap-2 cursor-pointer hover:text-(--color-primary) transition focus:text-(--color-primary) duration-300"
      >
        <FaUser />
      </div>

      <ul className="hidden group-focus-within:flex group-hover:flex flex-col gap-3 lg:gap-0 dropdown-content lg:menu bg-base-100 lg:w-52 z-10 p-2 shadow-sm group-focus-within:border-t border-(--color-primary) lg:border lg:border-white mt-2 lg:rounded-lg text-center">
        {Object.entries(data).map(([label, action]) => (
          <li key={label}>
            <button
              onClick={
                typeof action === "function"
                  ? action
                  : () => navigate(typeof action === "string" ? { pathname: action } : action)
              }
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

export default Avatar;
