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

  const bg = "rgba(5,8,15,0.92)";
  const border = "rgba(255,255,255,0.07)";

  return (
    <nav
      style={{
        background: bg,
        borderBottom: `1px solid ${border}`,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
      className="sticky top-0 w-full z-50 flex flex-col lg:flex-row items-stretch lg:items-center justify-between px-6 py-4"
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