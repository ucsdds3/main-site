import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";

import Page from "src/Shared/Page/Page";
import { formatMemberLinks, unbreakable } from "src/Utils/functions.tsx";
import { twMerge } from "src/Utils/cn";

import {
  boardTeamTabKeys,
  labelToTeamKey,
  memberMatchesTab,
  roleForMemberOnTab,
  teamDescriptionForKey,
  teamKeyToLabel,
} from "./boardTeamConfig";
import { useBoardMembers } from "./useBoardMembers";

const HoverCard = lazy(() => import("src/Shared/Components/HoverCard"));

const Board = () => {
  const navigate = useNavigate();

  const [team, setTeam] = useState<string>("");
  const { members, loading } = useBoardMembers(team);

  const teamKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const m of members) {
      for (const k of Object.keys(m.teamRoles)) keys.add(labelToTeamKey(k));
    }
    return boardTeamTabKeys(keys);
  }, [members]);

  useEffect(() => {
    if (teamKeys.length === 0) return;
    if (!team || !teamKeys.includes(team)) setTeam(teamKeys[0]);
  }, [teamKeys, team]);

  const filteredMembers = useMemo(
    () => members.filter(m => memberMatchesTab(m, team)),
    [members, team]
  );

  return (
    <Page>
      <div className="mx-auto flex w-full max-w-[1300px] flex-col gap-[clamp(2.5rem,4vw,4rem)] px-[clamp(1.25rem,4vw,3rem)] pb-[clamp(3rem,5vw,5rem)] pt-[clamp(5rem,9vw,9rem)]">
        {/* ── Hero header ── */}
        <div className="obs-section-header-border-loose">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="obs-eyebrow-row"
          >
            <div className="obs-accent-bar-orange" />
            <span className="text-eyebrow text-eyebrow-orange">The people behind DS3</span>
          </motion.div>

          <div className="flex flex-wrap items-end justify-between gap-6">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="m-0 font-heading text-[clamp(3rem,7vw,6rem)] font-normal leading-[0.95] tracking-tight text-(--obs-text-primary)"
            >
              Our Board
            </motion.h1>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              type="button"
              onClick={() => navigate({ pathname: "/", hash: "#get-involved" })}
              className="shrink-0 cursor-pointer rounded-4xl border border-[#F58134] bg-[rgba(245,129,52,0.08)] px-[1.4rem] py-[0.6rem] font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[#F58134] transition-colors duration-200"
              whileHover={{ background: "rgba(245,129,52,0.18)" }}
            >
              Join Us →
            </motion.button>
          </div>
        </div>

        {loading ? (
          <p className="m-0 font-body text-(--obs-text-primary) opacity-70">Loading board…</p>
        ) : teamKeys.length === 0 ? (
          <p className="m-0 font-body text-(--obs-text-primary) opacity-70">
            No board members are published yet.
          </p>
        ) : (
          <>
            {/* ── Team pill tabs ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap gap-2"
            >
              {teamKeys.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTeam(t)}
                  className={twMerge(
                    "cursor-pointer rounded-4xl border px-[0.9rem] py-[0.35rem] font-mono text-[0.62rem] uppercase tracking-[0.18em] transition-all duration-200",
                    t === team
                      ? "border-[#F58134] bg-[rgba(245,129,52,0.12)] text-[#F58134] opacity-100"
                      : "border-(--obs-border) bg-transparent text-(--obs-text-primary) opacity-55"
                  )}
                >
                  {unbreakable(teamKeyToLabel(t))}
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
                className="flex flex-col gap-8"
              >
                <div className="flex max-w-[720px] flex-col gap-3">
                  <h2 className="m-0 font-heading text-[clamp(1.85rem,2.8vw,2.5rem)] font-normal leading-[1.15] text-(--obs-text-primary)">
                    {unbreakable(teamKeyToLabel(team))} Team
                  </h2>
                  <p className="m-0 font-body text-[clamp(1.05rem,1.45vw,1.22rem)] font-normal leading-[1.65] text-(--obs-text-primary) opacity-[0.78]">
                    {teamDescriptionForKey(team)}
                  </p>
                </div>

                <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-[clamp(1rem,2vw,1.5rem)]">
                  {filteredMembers.map((member, index) => (
                    <Suspense
                      key={`${member.email ?? member.name}-${team}`}
                      fallback={<div className="aspect-square w-full" />}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: Math.min(index * 0.03, 0.6),
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <HoverCard
                          title={member.name}
                          description={roleForMemberOnTab(member, team)}
                          image={member.image}
                          size="200px"
                          links={formatMemberLinks(member)}
                          // Nudge crop up for Daniel: more hair, less shirt; same zoom.
                          imagePosition={
                            member.name.trim().toLowerCase() === "daniel mathews"
                              ? "center 22%"
                              : undefined
                          }
                        />
                      </motion.div>
                    </Suspense>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
    </Page>
  );
};

export default Board;
