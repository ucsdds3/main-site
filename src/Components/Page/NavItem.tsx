import { NavLink } from "react-router";
import { useState } from "react";

interface NavItemprops {
  dropdown?: { label: string; src: string }[];
  title: string;
  to: string;
  isActive?: boolean;
  onDropdownClick?: () => void;
  isDark?: boolean;
}

export default function NavItem({
  dropdown,
  title,
  to,
  isActive = false,
  onDropdownClick,
  isDark = false,
}: NavItemprops) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const activeColor = isDark ? "text-[#FF8B3E]" : "text-[#00B4D8]";
  const hoverColor = isDark ? "hover:text-[#FF8B3E]" : "hover:text-[#00B4D8]";

  if (!dropdown)
    return (
      <NavLink
        className={({ isActive: isLinkActive }) =>
          `text-white w-full md:w-auto text-center md:text-left py-2 md:py-0 transition-colors duration-200 ${hoverColor} ${
            isLinkActive ? activeColor : ""
          }`
        }
        to={to}
      >
        {title}
      </NavLink>
    );
  else
    return (
      <div
        className={`relative w-full md:w-auto md:group ${isActive ? activeColor : ""}`}
      >
        {/* Dropdown button */}
        <button
          className={`inline-flex items-center text-white w-full md:w-auto justify-center md:justify-start py-2 md:py-0 transition-colors duration-200 group-hover:${
            isDark ? "text-[#FF8B3E]" : "text-[#00B4D8]"
          } ${hoverColor}`}
          onClick={() => {
            setIsDropdownOpen(!isDropdownOpen);
            onDropdownClick?.();
          }}
        >
          {title}
          <svg
            className={`ml-1 w-4 h-4 transition-all duration-200 ${
              isActive ? activeColor : "text-gray-400"
            } group-hover:${isDark ? "text-[#FF8B3E]" : "text-[#00B4D8]"} ${hoverColor} transform ${
              isActive ? "rotate-0" : "rotate-180"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Mobile Dropdown Menu */}
        <div
          className={`
            ${isActive ? "block" : "hidden"} 
            md:hidden w-full bg-black border-t border-gray-700 mt-2
          `}
        >
          {dropdown.map((link, index: number) => (
            <NavLink
              className={({ isActive: isLinkActive }) =>
                `block w-full text-center px-4 py-2 text-white transition-colors duration-200 ${hoverColor} ${
                  isLinkActive ? activeColor : ""
                }`
              }
              to={link.src}
              key={index}
              onClick={() => {
                setIsDropdownOpen(false);
                onDropdownClick?.();
              }}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop Dropdown Menu */}
        <div
          className={`absolute top-full left-0 pt-2 hidden md:group-hover:block ${
            isActive ? "md:block" : ""
          }`}
        >
          <div className="relative bg-black border border-white rounded shadow-lg w-48">
            {/* Arrow (black fill + white border) */}
            <div className="absolute -top-3 left-8">
              <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[8px] border-l-transparent border-r-transparent border-b-white relative" />
              <div className="absolute top-[1px] left-[-7px] w-0 h-0 border-l-[7px] border-r-[7px] border-b-[7px] border-l-transparent border-r-transparent border-b-black" />
            </div>

            {/* Dropdown items */}
            {dropdown.map((link, index: number) => (
              <NavLink
                className={({ isActive: isLinkActive }) =>
                  `block w-full text-left px-4 py-2 text-white transition-colors duration-200 ${hoverColor} ${
                    isLinkActive ? activeColor : ""
                  }`
                }
                to={link.src}
                key={index}
                onClick={() => {
                  setIsDropdownOpen(false);
                  onDropdownClick?.();
                }}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    );
}
