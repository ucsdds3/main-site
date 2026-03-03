import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { lazy, Suspense } from "react";
import { useNavigate } from "react-router";

import Page from "src/Shared/Page/Page";
import { formatMemberLinks, unbreakable } from "src/Utils/functions.tsx";
import { MemberType } from "src/Utils/types.ts";

import teams from "./Data/teams.json";
import members from "./Data/board.json";

const HoverCard = lazy(() => import("src/Shared/Components/HoverCard"));

const Board = () => {
  const [team, setTeam] = useState<string>(Object.keys(teams)[0]);
  const navigate = useNavigate();

  const typedMembers = members as MemberType[];
  const filteredMembers = typedMembers.filter(m => m.teams?.includes(team));
  const teamKeys = Object.keys(teams);

  return (
    <Page>
      <div
        style={{
          width: "100%",
          maxWidth: 1300,
          margin: "0 auto",
          padding: "clamp(5rem, 9vw, 9rem) clamp(1.25rem, 4vw, 3rem) clamp(3rem, 5vw, 5rem)",
          display: "flex",
          flexDirection: "column",
          gap: "clamp(2.5rem, 4vw, 4rem)",
        }}
      >
        {/* ── Hero header ── */}
        <div style={{ borderBottom: "1px solid var(--obs-border, rgba(128,128,128,0.2))", paddingBottom: "clamp(1.5rem, 3vw, 3rem)" }}>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}
          >
            <div style={{ width: 22, height: 2, background: "#F58134", borderRadius: 2 }} />
            <span style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#F58134",
            }}>
              The people behind DS3
            </span>
          </motion.div>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem" }}>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: "clamp(3rem, 7vw, 6rem)",
                fontWeight: 400,
                lineHeight: 0.95,
                color: "var(--obs-text-primary)",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Our Board
            </motion.h1>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => navigate("/join-us")}
              style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.65rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                padding: "0.6rem 1.4rem",
                borderRadius: "2rem",
                border: "1px solid #F58134",
                background: "rgba(245,129,52,0.08)",
                color: "#F58134",
                cursor: "pointer",
                transition: "background 0.2s ease",
                flexShrink: 0,
              }}
              whileHover={{ background: "rgba(245,129,52,0.18)" }}
            >
              Join Us →
            </motion.button>
          </div>
        </div>

        {/* ── Team pill tabs ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
        >
          {teamKeys.map(t => (
            <button
              key={t}
              onClick={() => setTeam(t)}
              style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.62rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                padding: "0.35rem 0.9rem",
                borderRadius: "2rem",
                border: "1px solid",
                borderColor: t === team ? "#F58134" : "var(--obs-border, rgba(128,128,128,0.25))",
                background: t === team ? "rgba(245,129,52,0.12)" : "transparent",
                color: t === team ? "#F58134" : "var(--obs-text-primary)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                opacity: t === team ? 1 : 0.55,
              }}
            >
              {t}
            </button>
          ))}
        </motion.div>

        {/* ── Team description + members ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={team}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
          >
            {/* Team name + description */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", maxWidth: 640 }}>
              <h2 style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)",
                fontWeight: 400,
                color: "var(--obs-text-primary)",
                margin: 0,
                lineHeight: 1.15,
              }}>
                {unbreakable(team)} Team
              </h2>
              <p style={{
                fontSize: "clamp(0.88rem, 1.1vw, 1rem)",
                color: "var(--obs-text-primary)",
                opacity: 0.58,
                margin: 0,
                lineHeight: 1.7,
              }}>
                {teams[team as keyof typeof teams]}
              </p>
            </div>

            {/* Member grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "clamp(1rem, 2vw, 1.5rem)",
            }}>
              {filteredMembers.map((member, index) => (
                <Suspense key={index} fallback={<div style={{ width: "100%", aspectRatio: "1" }} />}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <HoverCard
                      title={member.name}
                      description={member.role}
                      image={member.image}
                      size="200px"
                      links={formatMemberLinks(member)}
                    />
                  </motion.div>
                </Suspense>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </Page>
  );
};

export default Board;