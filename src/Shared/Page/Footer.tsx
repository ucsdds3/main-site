import SafeLink from "../Components/SafeLink.tsx";
import { useTheme } from "src/Hooks/useTheme";
import socialMedia from "./Data/socialMedia.tsx";

const Footer = () => {
  const { isDark } = useTheme();

  const bg     = isDark ? "rgba(5,8,15,0.95)"      : "rgba(235,229,220,0.95)";
  const border = isDark ? "rgba(255,255,255,0.07)"  : "rgba(10,20,50,0.1)";
  const textPrimary = isDark ? "rgba(255,255,255,0.75)" : "rgba(10,20,50,0.75)";
  const textFaint   = isDark ? "rgba(255,255,255,0.28)" : "rgba(10,20,50,0.32)";

  return (
    <footer
      style={{
        background: bg,
        borderTop: `1px solid ${border}`,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div className="mx-auto flex max-w-[1600px] flex-row flex-wrap items-center justify-between gap-8 py-8 fl-px-5/10">
        {/* Left: logo + name */}
        <div className="flex items-center fl-gap-2/4">
          <img src="/logo.webp" alt="DS3 Logo" className="shrink-0 opacity-90 fl-size-[28px/42px]" />
          <div className="flex flex-col gap-0.5">
            <span
              className="font-mono font-medium uppercase tracking-[0.2em] fl-text-xs/sm"
              style={{ color: textPrimary }}
            >
              Data Science Student Society (DS3) @ UC San Diego
            </span>
            <span className="font-mono tracking-[0.12em] fl-text-xs/sm" style={{ color: textFaint }}>
              © 2026 All Rights Reserved
            </span>
          </div>
        </div>

        {/* Right: social icons */}
        <div className="flex items-center fl-gap-1/2">
          {socialMedia.map((media, index) => (
            <SafeLink
              key={index}
              title={media.title}
              href={media.link}
              className="flex items-center justify-center rounded-full border transition-colors duration-200 fl-size-[30px/42px] fl-text-sm/xl"
              style={{
                borderColor: border,
                color: textFaint,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = "#19B5CA"
                e.currentTarget.style.borderColor = "rgba(25,181,202,0.5)"
                e.currentTarget.style.background = "rgba(25,181,202,0.08)"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = textFaint
                e.currentTarget.style.borderColor = border
                e.currentTarget.style.background = "none"
              }}
            >
              {media.icon}
            </SafeLink>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;