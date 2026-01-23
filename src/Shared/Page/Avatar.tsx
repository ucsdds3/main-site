import { FaUser } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";

import { useSiteHandler } from "src/Hooks/useSiteHandler";
import { useSignOut } from "src/Hooks/Members/Auth/useSignOut";

const Avatar = () => {
  const { navigate } = useSiteHandler();
  const { handleSignOut } = useSignOut();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const data = {
    "Main Site": { pathname: "/", subdomain: "main" },
    Profile: "/profile",
    "Sign Out": () => handleSignOut(),
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative group w-full lg:w-auto lg:dropdown lg:dropdown-end">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className="flex justify-center items-center gap-2 cursor-pointer hover:text-(--color-primary) transition focus:text-(--color-primary) duration-300"
      >
        <FaUser className="hidden lg:block" />
        <span className="hover:text-(--color-primary) relative cursor-pointer lg:hidden">Profile</span>
      </div>

      <ul className={`${isOpen ? 'flex' : 'hidden'} flex-col gap-3 lg:gap-0 dropdown-content lg:menu bg-base-100 lg:w-52 z-10 p-2 shadow-sm border-t border-(--color-primary) lg:border lg:border-white mt-2 lg:rounded-lg text-center`}>
        {Object.entries(data).map(([label, action]) => (
          <li key={label}>
            <button
              onClick={() => {
                if (typeof action === "function") {
                  action();
                } else {
                  navigate(typeof action === "string" ? { pathname: action } : action);
                }
                setIsOpen(false);
              }}
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
