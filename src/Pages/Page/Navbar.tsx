import { useState } from "react";
import logo from "/src/Assets/Images/ds3_logo.png";
import { useTheme } from "../../Hooks/useTheme";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoClose } from "react-icons/io5";
import Links from "./Links";
import { useSiteHandler } from "../../Hooks/useSiteHandler";
import { HashLink } from "react-router-hash-link";

const Navbar = () => {
  const isConsulting = useSiteHandler();
  const { isDark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className="bg-[#0E1111] sticky top-0 w-full z-50 border-b border-(--color-primary) flex flex-col lg:flex-row items-center justify-between px-6 py-4"
      data-theme="dark"
    >
      {/* Top bar with logo and mobile menu button */}
      <div className="w-full lg:w-auto flex items-center justify-between">
        <div className="flex items-center gap-5">
          <HashLink
            smooth
            to={isConsulting ? { hash: "#home", search: "site=consulting" } : "/#home"}
            className="space-x-2 cursor-pointer hover:-rotate-180 transition-all duration-500"
          >
            <img src={logo} alt="Logo" className="w-10" />
          </HashLink>

          {/* Theme Toggle */}
          <label className="toggle text-base-content" id="theme-toggle">
            <input type="checkbox" checked={isDark} onChange={toggleTheme} />
            <MdLightMode aria-label="disabled" />
            <MdDarkMode aria-label="enabled" />
          </label>
        </div>

        {/* Mobile menu button */}
        <label className="swap swap-rotate lg:hidden">
          <input type="checkbox" checked={menuOpen} onChange={() => setMenuOpen((prev) => !prev)} />
          <IoClose aria-label="enabled" className="swap-on text-2xl" />
          <GiHamburgerMenu aria-label="disabled" className="swap-off text-2xl" />
        </label>
      </div>

      <Links menuOpen={menuOpen} />
    </nav>
  );
};

export default Navbar;
