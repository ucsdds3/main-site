import { FaUser } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";

import { useSiteHandler } from "src/Hooks/useSiteHandler";
import { useSignOut } from "src/Hooks/useSignOut";

const Avatar = () => {
  const { navigate } = useSiteHandler();
  const { handleSignOut } = useSignOut();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const data = {
    Profile: "/profile",
    "Main Site": { pathname: "/", subdomain: "main" },
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

  const handleAction = (_label: string, action: unknown) => {
    if (typeof action === "function") {
      action();
    } else {
      navigate(typeof action === "string" ? { pathname: action } : action as { pathname: string; subdomain?: string });
    }
    setIsOpen(false);
  };

  const linkClass = "hover:text-(--color-primary) relative flex items-center justify-center gap-1 cursor-pointer w-full lg:w-auto";

  return (
    <>
      {/* Mobile: direct links like NavItem */}
      {Object.entries(data).map(([label, action]) => (
        <button
          key={label}
          onClick={() => handleAction(label, action)}
          className={`${linkClass} lg:hidden`}
        >
          {label}
        </button>
      ))}

      {/* Desktop: dropdown */}
      <div ref={dropdownRef} className="relative group w-full lg:w-auto lg:dropdown lg:dropdown-end hidden lg:block">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
          className="flex justify-center items-center gap-2 cursor-pointer hover:text-(--color-primary) transition focus:text-(--color-primary) duration-300"
        >
          <FaUser />
        </div>

        <ul className={`${isOpen ? "flex" : "hidden"} flex-col gap-3 lg:gap-0 dropdown-content lg:menu bg-base-100 lg:w-52 z-10 p-2 shadow-sm border-t border-(--color-primary) lg:border lg:border-white mt-2 lg:rounded-lg text-center touch-manipulation`}>
          {Object.entries(data).map(([label, action]) => (
            <li key={label}>
              <button
                type="button"
                className="hover:text-(--color-primary) text-base cursor-pointer touch-manipulation"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleAction(label, action);
                }}
                onClick={(e) => {
                  if (e.detail === 0) {
                    handleAction(label, action);
                  }
                }}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Avatar;
