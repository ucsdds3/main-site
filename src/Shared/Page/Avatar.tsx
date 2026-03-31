import { FaUser } from "react-icons/fa";
import { useState, useRef, useEffect, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useSiteHandler } from "src/Hooks/useSiteHandler";
import { useSignOut } from "src/Hooks/useSignOut";
import { useTheme } from "src/Hooks/useTheme";

const MENU_ITEMS = [
  { label: "Profile", pathname: "/profile" as const },
  { label: "Sign Out", signOut: true as const },
] as const;

const Avatar = () => {
  const { navigate } = useSiteHandler();
  const { handleSignOut } = useSignOut();
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const dropdownBg = isDark ? "rgba(8,14,25,0.97)" : "rgba(238,232,222,0.97)";
  const dropdownBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(10,20,50,0.1)";
  const itemHoverBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(10,20,50,0.05)";
  const textColor = isDark ? "rgba(255,255,255,0.7)" : "rgba(10,20,50,0.7)";
  const textHover = isDark ? "rgba(255,255,255,0.95)" : "rgba(10,20,50,0.95)";

  const linkStyle: CSSProperties = {
    color: textColor,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0.25rem 0",
    transition: "color 0.2s ease",
  };
  const linkClass =
    "font-mono text-[0.72rem] uppercase tracking-[0.14em] flex items-center gap-[0.35rem] whitespace-nowrap w-full lg:w-auto justify-start";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const runMenuAction = (item: (typeof MENU_ITEMS)[number]) => {
    if ("pathname" in item) {
      navigate({ pathname: item.pathname });
    } else {
      handleSignOut();
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile: Profile + Sign Out as nav-style text buttons */}
      <div className="flex w-full flex-col gap-3 lg:hidden">
        {MENU_ITEMS.map(item => (
          <button
            key={item.label}
            type="button"
            className={linkClass}
            style={linkStyle}
            onMouseEnter={e => (e.currentTarget.style.color = textHover)}
            onMouseLeave={e => (e.currentTarget.style.color = textColor)}
            onClick={() => runMenuAction(item)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Desktop: same dropdown panel as NavItem */}
      <div ref={dropdownRef} className="relative hidden w-full lg:block lg:w-auto">
        <button
          type="button"
          className={`${linkClass} justify-center lg:justify-start`}
          style={linkStyle}
          onMouseEnter={e => (e.currentTarget.style.color = textHover)}
          onMouseLeave={e => (e.currentTarget.style.color = textColor)}
          onClick={() => setIsOpen(p => !p)}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsOpen(p => !p);
            }
          }}
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          <FaUser className="text-base" aria-hidden />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.ul
              role="menu"
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: dropdownBg,
                border: `1px solid ${dropdownBorder}`,
                borderRadius: "0.75rem",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                boxShadow: isDark ? "0 16px 40px rgba(0,0,0,0.5)" : "0 16px 40px rgba(0,0,0,0.12)",
                padding: "0.4rem",
                zIndex: 100,
                listStyle: "none",
                margin: 0,
              }}
              className="relative mt-2 w-full min-w-0 lg:absolute lg:mt-0 lg:top-[calc(100%+10px)] lg:right-0 lg:w-max lg:min-w-[160px]"
            >
              <div
                style={{
                  position: "absolute",
                  top: -5,
                  right: "5%",
                  transform: "translateX(-50%) rotate(45deg)",
                  width: 8,
                  height: 8,
                  background: dropdownBg,
                  border: `1px solid ${dropdownBorder}`,
                  borderBottom: "none",
                  borderRight: "none",
                }}
                className="hidden lg:block"
                aria-hidden
              />

              {MENU_ITEMS.map(item => (
                <li key={item.label} role="none">
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full whitespace-nowrap rounded-lg border-none bg-transparent px-[0.85rem] py-[0.55rem] text-left font-mono text-[0.68rem] uppercase tracking-[0.12em] transition-[background,color] duration-150"
                    style={{
                      color: textColor,
                      cursor: "pointer",
                    }}
                    onClick={() => runMenuAction(item)}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = itemHoverBg;
                      e.currentTarget.style.color = textHover;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "none";
                      e.currentTarget.style.color = textColor;
                    }}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Avatar;
