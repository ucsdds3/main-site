import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { useNavigate } from "react-router";
import { useRef } from "react";

import dino from "/src/Assets/Images/dino.webp";
import Star from "src/Shared/Components/Star";
import starData from "../Data/stars.json";

/* ─────────────────────────────────────────
   Revamped DS3 Landing — "Dark Observatory"
   ───────────────────────────────────────── */

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

const slideUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const Landing = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  // const stars = starData.positions[Math.round(Math.random() * 4)];

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  // const dinoY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 40]);

  return (
    <div
      ref={heroRef}
      id="home"
      className="relative overflow-hidden min-h-screen w-full"
      style={{
        background: "linear-gradient(135deg, #05080f 0%, #0b1220 50%, #0d1a2a 100%)",
        fontFamily: "'DM Serif Display', Georgia, serif",
      }}
    >
      {/* ── Ambient grid overlay ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#8af0ff 1px, transparent 1px), linear-gradient(90deg, #8af0ff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Radial glow blobs ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(25,181,202,0.12) 0%, transparent 70%)",
          top: "-15%",
          left: "-10%",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,129,52,0.08) 0%, transparent 70%)",
          bottom: "0",
          right: "5%",
        }}
      />

      {/* ── Stars layer ── */}
      {/* <motion.div
        variants={starData.appearingVariants}
        animate="animate"
        className="absolute inset-0 -z-0 pointer-events-none"
      >
        {stars.map((star: { x: number; y: number; w: number }, index: number) => (
          <Star
            key={index}
            size={star.w}
            className="absolute opacity-70"
            style={{ top: `${star.y}%`, left: `${star.x}%` }}
          />
        ))}
      </motion.div> */}

      {/* ── Decorative large label ── */}
      <motion.p
        style={{ y: bgY, color: "#ffffff", fontFamily: "sans-serif" }}
        aria-hidden
        className="pointer-events-none select-none absolute right-[-2rem] top-[10%] text-[clamp(6rem,14vw,16rem)] font-black leading-none opacity-[0.03] tracking-tighter"
      >
        DS3
      </motion.p>

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between min-h-screen max-w-[1400px] mx-auto px-6 md:px-16 py-20 gap-12">

        {/* Left: Text block */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col max-w-[620px] text-white"
        >
          {/* Pill badge */}
          <motion.div variants={slideUp} className="mb-6 w-fit">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs tracking-[0.2em] uppercase"
              style={{
                border: "1px solid rgba(25,181,202,0.4)",
                background: "rgba(25,181,202,0.08)",
                color: "#19B5CA",
                fontFamily: "ui-monospace, monospace",
              }}
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "#19B5CA" }}
              />
              Student Organization · UC San Diego
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={slideUp}
            className="leading-[1.05] tracking-tight mb-2"
            style={{
              fontSize: "clamp(3rem, 6vw, 5.5rem)",
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontWeight: 400,
            }}
          >
            Data Science
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #19B5CA, #F58134)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Student Society
            </span>
          </motion.h1>

          {/* Tagline trio */}
          <motion.div
            variants={slideUp}
            className="flex gap-4 mt-4 mb-6"
            style={{ fontFamily: "ui-monospace, monospace", fontSize: "clamp(0.7rem, 1.2vw, 0.9rem)" }}
          >
            {[
              { label: "LEARN", color: "#F58134" },
              { label: "BUILD", color: "#19B5CA" },
              { label: "INNOVATE", color: "#A9A9A9" },
            ].map(({ label, color }) => (
              <span
                key={label}
                className="tracking-[0.2em]"
                style={{ color }}
              >
                {label}
              </span>
            ))}
          </motion.div>

          {/* Description */}
          <motion.p
            variants={slideUp}
            className="text-[clamp(1rem,1.4vw,1.2rem)] leading-relaxed mb-10"
            style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'Albert Sans', sans-serif", fontWeight: 300 }}
          >
            Expanding the horizons of data science through community,
            curiosity, and collaboration. Join a network of builders and thinkers.
          </motion.p>

          {/* CTA row */}
          <motion.div variants={slideUp} className="flex items-center gap-6 flex-wrap">
            <button
              onClick={() => navigate("/join-us")}
              className="group relative overflow-hidden px-8 py-3.5 rounded-full text-sm font-semibold tracking-widest uppercase transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #19B5CA, #0e8fa0)",
                color: "#fff",
                fontFamily: "ui-monospace, monospace",
                boxShadow: "0 0 30px rgba(25,181,202,0.3)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 0 50px rgba(25,181,202,0.55)";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 0 30px rgba(25,181,202,0.3)";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              }}
            >
              Join Us
            </button>

            <button
              onClick={() => navigate("/about")}
              className="text-sm tracking-widest uppercase transition-all duration-200 hover:opacity-100"
              style={{
                color: "rgba(255,255,255,0.4)",
                fontFamily: "ui-monospace, monospace",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.85)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.4)";
              }}
            >
              Learn More →
            </button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={slideUp}
            className="flex gap-8 mt-14 pt-8"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            {[
              { value: "500+", label: "Members" },
              { value: "30+", label: "Events/Year" },
              { value: "10+", label: "Industry Partners" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div
                  className="text-2xl font-semibold"
                  style={{
                    fontFamily: "'DM Serif Display', Georgia, serif",
                    color: "#fff",
                  }}
                >
                  {value}
                </div>
                <div
                  className="text-xs tracking-widest uppercase mt-0.5"
                  style={{ color: "rgba(255,255,255,0.35)", fontFamily: "ui-monospace, monospace" }}
                >
                  {label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: Dino + floating card */}
        <div className="relative flex-shrink-0 flex items-end justify-center lg:items-end">
          {/* Glow plate behind dino */}
          <div
            aria-hidden
            className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full blur-3xl"
            style={{
              width: 300,
              height: 80,
              background: "rgba(25,181,202,0.18)",
            }}
          />

          {/* Floating info card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-8 -left-4 md:-left-12 rounded-2xl p-4 text-white"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(16px)",
              minWidth: 140,
            }}
          >
            <p
              className="text-xs uppercase tracking-widest mb-1"
              style={{ color: "rgba(255,255,255,0.35)", fontFamily: "ui-monospace, monospace" }}
            >
              Next Event
            </p>
            <p className="text-sm font-medium" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
              Workshop: Intro to ML
            </p>
            <p className="text-xs mt-1" style={{ color: "#19B5CA", fontFamily: "ui-monospace, monospace" }}>
              Fri · Week 7
            </p>
          </motion.div>

          {/* <motion.img
            src={dino}
            alt="DS3 Dino Mascot"
            style={{
              y: dinoY,
              width: "clamp(220px, 28vw, 420px)",
              filter: "drop-shadow(0 20px 40px rgba(25,181,202,0.2))",
            }}
            animate={{ y: [0, -18, 0], rotate: [12, 7, 12] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          /> */}
        </div>
      </div>

      {/* ── Bottom scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span
          className="text-xs tracking-[0.25em] uppercase"
          style={{ color: "rgba(255,255,255,0.2)", fontFamily: "ui-monospace, monospace" }}
        >
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-8"
          style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)" }}
        />
      </motion.div>
    </div>
  );
};

export default Landing;