import { useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoClose } from "react-icons/io5";

import { useSiteHandler } from "src/Hooks/useSiteHandler";
import { useAuthStore } from "src/Sites/Members/Hooks/useAuthStore";

import Links from "./Links";

const Navbar = () => {
  const { authState } = useAuthStore();
  const { subdomain, navigate } = useSiteHandler();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 flex w-full flex-col items-stretch justify-between border-b border-[rgba(255,255,255,0.07)] bg-[rgba(5,8,15,0.92)] px-6 py-4 backdrop-blur-[16px] lg:flex-row lg:items-center">
      {/* Top bar */}
      <div className="w-full lg:w-auto flex items-center justify-between">
        <div className="flex items-center gap-5">
          <button
            type="button"
            className="cursor-pointer border-none bg-transparent p-0 [&:hover>img]:-rotate-180"
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