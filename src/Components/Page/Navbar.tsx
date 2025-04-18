import { Link } from "react-router";
import NavItem from "./NavItem";
import { useState } from "react";
import logo from "/src/Assets/Images/ds3_logo.png";
import { useTheme } from "../../Store/useTheme";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoClose } from "react-icons/io5";
import navData from "../../Assets/Data/navbar.json";

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const typographyClasses = "font-quicksand font-normal tracking-[0px]";

  return (
    <nav
      className="bg-[#0E1111] sticky w-full z-50 border-b border-(--color-primary) flex flex-col md:flex-row items-center justify-between px-6 py-4"
      data-theme="dark"
    >
      {/* Top bar with logo and mobile menu button */}
      <div className="w-full md:w-auto flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Link
            to="/"
            className="space-x-2 cursor-pointer hover:-rotate-180 transition-all duration-500"
          >
            <img src={logo} alt="Logo" className="w-10" />
          </Link>

          {/* Theme Toggle */}
          <label className="toggle text-base-content" id="theme-toggle">
            <input type="checkbox" checked={isDark} onChange={toggleTheme} />
            <MdLightMode aria-label="disabled" />
            <MdDarkMode aria-label="enabled" />
          </label>
        </div>

        {/* Mobile menu button */}
        <label className="swap swap-rotate md:hidden">
          <input type="checkbox" checked={menuOpen} onChange={() => setMenuOpen(!menuOpen)} />
          <IoClose aria-label="enabled" className="swap-on text-2xl" />
          <GiHamburgerMenu aria-label="disabled" className="swap-off text-2xl" />
        </label>
      </div>

      {/* Navigation links */}
      <div
        className={`w-full md:w-auto items-center flex-col md:flex md:flex-row gap-4 ${
          menuOpen ? "flex" : "hidden"
        } ${typographyClasses}`}
      >
        {Object.entries(navData).map(([label, data]) => (
          <NavItem key={label} label={label} data={data} />
        ))}

        <Link
          to="/join"
          className={`bg-(--color-primary) px-4 py-2 hover:brightness-110 cursor-pointer rounded-xl text-center ${typographyClasses} font-semibold w-full md:w-auto`}
        >
          JOIN US
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
