import { useNavigate } from "react-router";
import NavItem from "./NavItem";
import { useState } from "react";
import logo from "/src/Assets/Images/ds3_logo.png";
import { useTheme } from "../../Store/useTheme";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";

const EventsDropdown = [
  {
    label: "Upcoming",
    src: "/events/upcoming",
  },
  {
    label: "Datahacks",
    src: "/events/datahacks",
  },
  {
    label: "Workshops",
    src: "/events/workshops",
  },
  {
    label: "Social",
    src: "/events/social",
  },
  {
    label: "Professional",
    src: "/events/professional",
  },
];

const OurTeamDropdown = [
  { label: "Meet the Board", src: "/our-team/board" },
  { label: "Alumni", src: "/our-team/alumni" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const typographyClasses = "font-quicksand font-normal tracking-[0px]";

  const handleDropdownClick = (dropdownName: string) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  return (
    <>
      <nav className="bg-[#0E1111] fixed w-full z-50">
        <div className="flex flex-col md:flex-row items-center justify-between px-6 py-2 md:py-4">
          {/* Top bar with logo and mobile menu button */}
          <div className="w-full md:w-auto flex items-center justify-between">
            <div className="flex items-center gap-5">
              <a
                className="space-x-2 cursor-pointer hover:-rotate-180 transition-all duration-500"
                onClick={() => navigate("/")}
              >
                <img src={logo} alt="Logo" className="w-10 h-auto" />
              </a>

              {/* Theme Toggle */}
              <label className="toggle">
                <input type="checkbox" checked={isDark} onChange={toggleTheme} />
                <MdLightMode aria-label="enabled" />
                <MdDarkMode aria-label="disabled" />
              </label>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white p-2"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>

            <label className="btn btn-circle swap swap-rotate md:hidden">
              <input type="checkbox" checked={isMobileMenuOpen} onChange={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
              <GiHamburgerMenu aria-label="enabled" />
              <IoMdClose aria-label="disabled" />
            </label>
          </div>

          {/* Mobile menu and desktop navigation */}
          <div
            className={`${
              isMobileMenuOpen ? "flex" : "hidden"
            } md:flex flex-col md:flex-row w-full md:w-auto items-center space-y-2 md:space-y-0 md:space-x-6 mt-2 md:mt-0 ${typographyClasses}`}
          >
            {/* Navigation items */}
            <NavItem
              title="Events"
              to="/our-team"
              dropdown={EventsDropdown}
              isActive={activeDropdown === "Events"}
              onDropdownClick={() => handleDropdownClick("Events")}
              isDark={isDark}
            />
            <NavItem
              title="Our Team"
              to=""
              dropdown={OurTeamDropdown}
              isActive={activeDropdown === "Our Team"}
              onDropdownClick={() => handleDropdownClick("Our Team")}
              isDark={isDark}
            />
            <NavItem title="Projects" to="/projects" isDark={isDark} />
            <NavItem title="Consulting" to="/consulting" isDark={isDark} />
            <NavItem title="Partners" to="/partners" isDark={isDark} />

            {/* JOIN US button */}
            <button
              className={`${
                isDark ? "bg-[#FF8B3E]" : "bg-[#00B4D8]"
              } px-4 py-2 hover:bg-gray-200 rounded-xl ${typographyClasses} font-semibold w-full md:w-auto`}
              onClick={() => navigate("/join")}
            >
              JOIN US
            </button>
          </div>
        </div>
      </nav>
      {/* Spacer div that adjusts height based on mobile menu and dropdown state */}
      <div
        className={`w-full transition-all duration-200 ${
          isMobileMenuOpen
            ? activeDropdown
              ? "h-[600px]" // Further increased height when mobile menu and dropdown are open
              : "h-[480px]" // Further increased height when only mobile menu is open
            : "h-[60px]" // Default navbar height
        }`}
      />
    </>
  );
};

export default Navbar;
