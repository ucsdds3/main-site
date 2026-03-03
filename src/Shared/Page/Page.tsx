import "simplebar-react/dist/simplebar.min.css";
import SimpleBar from "simplebar-react";

import { useTheme } from "src/Hooks/useTheme";
import sleepyDark from "src/Assets/Images/under_construction_dark.png";
import sleepyLight from "src/Assets/Images/under_construction_light.png";

import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollArrow from "./ScrollArrow";

interface PageProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  scrollRef?: React.RefObject<HTMLDivElement>;
}

const Page = ({ children, scrollRef, ...props }: PageProps) => {
  const { isDark } = useTheme();

  const bg = isDark
    ? "linear-gradient(135deg,#05080f 0%,#0b1220 50%,#0d1a2a 100%)"
    : "linear-gradient(135deg,#f5f0eb 0%,#f2ede6 0%,#efe9e0 100%)";

  // CSS vars cascade to every child component — single source of truth for theming
  const themeVars = {
    "--obs-text-primary":  isDark ? "rgba(255,255,255,0.92)" : "rgba(10,20,50,0.92)",
    "--obs-text-muted":    isDark ? "rgba(255,255,255,0.48)" : "rgba(10,20,50,0.5)",
    "--obs-text-faint":    isDark ? "rgba(255,255,255,0.28)" : "rgba(10,20,50,0.32)",
    "--obs-border":        isDark ? "rgba(255,255,255,0.07)" : "rgba(10,20,50,0.08)",
    "--obs-border-mid":    isDark ? "rgba(255,255,255,0.12)" : "rgba(10,20,50,0.12)",
    "--obs-surface":       isDark ? "rgba(255,255,255,0.04)" : "rgba(10,20,50,0.03)",
    "--obs-surface-hover": isDark ? "rgba(255,255,255,0.07)" : "rgba(10,20,50,0.05)",
  } as React.CSSProperties;

  return (
    <SimpleBar className="absolute left-0 top-0 w-screen h-screen overflow-x-hidden">
      {/*
        SimpleBar injects its own wrapper divs — applying background/vars to SimpleBar itself
        doesn't reliably cascade. This inner div is what we fully control.
      */}
      <div style={{ background: bg, minHeight: "100vh", ...themeVars }}>

        {/* ── Full-page ambient grid ── */}
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(138,240,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(138,240,255,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            opacity: isDark ? 0.03 : 0.06,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <Navbar />

        <div className="flex flex-col items-center min-h-[80vh]" {...props}>
          {scrollRef && <ScrollArrow ref={scrollRef} />}
          {children || (
            <>
              <h2 className="text-center hero-text-shadow my-10 text-[clamp(2rem,10vw,4rem)]">
                Coming Soon
              </h2>
              <img
                src={isDark ? sleepyDark : sleepyLight}
                alt="Under Construction"
                className="bear mt-[clamp(5rem,5vw,10rem)] w-[clamp(10rem,30vw,30rem)]"
              />
            </>
          )}
        </div>

        <Footer />
      </div>
    </SimpleBar>
  );
};

export default Page;