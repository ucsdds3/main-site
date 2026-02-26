import { IoIosArrowUp } from "react-icons/io";
import { useState, useRef, useEffect } from "react";

import { useSiteHandler } from "src/Hooks/useSiteHandler";
import { NavigateProps } from "src/Utils/types";

interface NavItemProps {
  label: string;
  data?: string | Record<string, string>;
}

const NavItem = ({ label, data }: NavItemProps) => {
  const { navigate } = useSiteHandler();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const parseData = (data: string | Record<string, string>) => {
    if (typeof data === "string")
      return data[0] == "#" ? { hash: data.slice(1) } : { pathname: data };
    return data as NavigateProps;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const linkClass =
    "hover:text-(--color-primary) relative flex items-center justify-center gap-1 cursor-pointer w-full lg:w-auto";

  return typeof data === "string" || data?.hash || data?.subdomain ? (
    <button
      onClick={() => navigate(parseData(data))}
      className={`${linkClass}`}
    >
      {label}
    </button>
  ) : (
    <>
      {/* Mobile: direct links like Avatar */}
      {Object.entries(data as object).map(([itemLabel, to]) => (
        <button
          key={itemLabel}
          onClick={() => navigate(parseData(to as string))}
          className={`${linkClass} lg:hidden`}
        >
          {itemLabel}
        </button>
      ))}

      {/* Desktop: dropdown */}
      <div
        ref={dropdownRef}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className="relative group w-full lg:w-auto lg:dropdown lg:dropdown-end hidden lg:block"
      >
        <div
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
          className="flex justify-center items-center gap-2 cursor-pointer hover:text-(--color-primary) transition focus:text-(--color-primary) duration-300"
        >
          <span>{label}</span>
          <IoIosArrowUp
            className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>

        <ul
          className={`${isOpen ? "flex" : "hidden"} flex-col gap-3 lg:gap-0 dropdown-content lg:menu bg-base-100 lg:w-52 z-10 p-2 shadow-sm border-t border-(--color-primary) lg:border lg:border-white mt-2 lg:rounded-lg text-center touch-manipulation`}
        >
          {Object.entries(data as object).map(([itemLabel, pathname]) => (
            <li key={itemLabel}>
              <button
                type="button"
                className="hover:text-(--color-primary) text-base cursor-pointer touch-manipulation"
                onMouseDown={e => {
                  e.preventDefault();
                  navigate(parseData(pathname as string));
                  setIsOpen(false);
                }}
                onClick={e => {
                  if (e.detail === 0) {
                    navigate(parseData(pathname as string));
                    setIsOpen(false);
                  }
                }}
              >
                {itemLabel}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default NavItem;
