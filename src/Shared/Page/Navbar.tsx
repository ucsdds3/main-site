import { useState } from "react";
import { useLocation } from "react-router";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoClose } from "react-icons/io5";

import { useTheme } from "src/Hooks/useTheme";
import { useSiteHandler } from "src/Hooks/useSiteHandler";
import { useAuthStore } from "src/Sites/Members/Hooks/useAuthStore";

import Links from "./Links";

const Navbar = () => {
  const { authState } = useAuthStore();
  const { subdomain, navigate } = useSiteHandler();
  const { isDark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = useLocation().pathname;

  const bg      = isDark ? "rgba(5,8,15,0.92)"      : "rgba(242,237,230,0.92)";
  const border  = isDark ? "rgba(255,255,255,0.07)"  : "rgba(10,20,50,0.1)";

  return (
    <nav
      style={{
        background: bg,
        borderBottom: `1px solid ${border}`,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
      className="sticky top-0 w-full z-50 flex flex-col lg:flex-row items-center justify-between px-6 py-4"
    >
      {/* Top bar */}
      <div className="w-full lg:w-auto flex items-center justify-between">
        <div className="flex items-center gap-5">
          <button
            className="cursor-pointer [&:hover>img]:-rotate-180"
            style={{ background: "none", border: "none", padding: 0 }}
            onClick={() =>
              navigate({
                pathname: "/",
                subdomain: authState === "authenticated" ? subdomain : "main",
                hash: "home",
              })
            }
          >
            <img src="/logo.webp" alt="Logo" className="w-10 transition-all duration-500" />
          </button>

          {pathname !== "/admin" && (
            <label className="toggle text-base-content" id="theme-toggle">
              <input type="checkbox" checked={isDark} onChange={toggleTheme} />
              <MdLightMode aria-label="disabled" />
              <MdDarkMode aria-label="enabled" />
            </label>
          )}
        </div>

        {/* Mobile menu button */}
        <label className="swap swap-rotate lg:hidden">
          <input type="checkbox" checked={menuOpen} onChange={() => setMenuOpen(prev => !prev)} />
          <IoClose aria-label="enabled" className="swap-on text-2xl" />
          <GiHamburgerMenu aria-label="disabled" className="swap-off text-2xl" />
        </label>
      </div>

      <Links menuOpen={menuOpen} />
    </nav>
  );
};

export default Navbar;