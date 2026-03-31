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
      <div
        style={{
          maxWidth: 1600,
          margin: "0 auto",
          padding: "2rem clamp(1.25rem, 3vw, 2.5rem)",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "2rem",
          flexWrap: "wrap",
        }}
      >
        {/* Left: logo + name */}
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(0.65rem, 1.2vw, 1rem)" }}>
          <img src="/logo.webp" alt="DS3 Logo" style={{ width: "clamp(28px, 3vw, 42px)", opacity: 0.9, flexShrink: 0 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "clamp(0.62rem, 0.8vw, 0.88rem)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: textPrimary,
              fontWeight: 500,
            }}>
              Data Science Student Society (DS3) @ UC San Diego
            </span>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "clamp(0.5rem, 0.6vw, 0.72rem)",
              letterSpacing: "0.12em",
              color: textFaint,
            }}>
              © 2026 All Rights Reserved
            </span>
          </div>
        </div>

        {/* Right: social icons */}
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(0.25rem, 0.5vw, 0.45rem)" }}>
          {socialMedia.map((media, index) => (
            <SafeLink
              key={index}
              title={media.title}
              href={media.link}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "clamp(30px, 3.2vw, 42px)",
                height: "clamp(30px, 3.2vw, 42px)",
                borderRadius: "50%",
                border: `1px solid ${border}`,
                color: textFaint,
                fontSize: "clamp(0.85rem, 1.1vw, 1.25rem)",
                transition: "color 0.2s ease, border-color 0.2s ease, background 0.2s ease",
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