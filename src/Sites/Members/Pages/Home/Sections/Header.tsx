import { motion } from "framer-motion";

import Section from "src/Shared/Page/Section";

import { useAuthStore } from "../../../Hooks/useAuthStore";
import { useHeaderStats } from "../Hooks/useHeaderStats";
import Avatar from "../Components/Avatar";

const Header = () => {
  const { user } = useAuthStore();
  const { xp, xpNeeded, progress, tier, nextTier, points } = useHeaderStats();

  return (
    <Section className="flex-row flex-wrap items-center justify-center">
      <Avatar />
      <div className="obs-panel flex min-h-68 flex-1 flex-col gap-8 p-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="obs-eyebrow-row mb-0"
        >
          <div className="obs-accent-bar-cyan shrink-0" />
          <span className="text-eyebrow text-eyebrow-cyan">Member home</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="text-fluid-subsection-title text-balance"
        >
          Welcome back, <span className="text-[#19B5CA]">{user?.user_metadata.full_name}</span>.
          Here are your stats:
        </motion.h1>

        <div className="flex min-w-[min(50vw,400px)] size-full items-center justify-around">
          <div className="flex flex-col items-center">
            <span className="fl-text-2xl/4xl font-bold text-[#19B5CA]">
              {xp % 1000} / {xpNeeded}
            </span>
            <span className="fl-text-lg/2xl text-(--obs-text-muted)">Experience</span>
            <span className="mt-4 max-w-56 text-balance text-center fl-text-sm/base text-(--obs-text-muted)">
              You&apos;re <span className="text-[#19B5CA]">{Math.round(progress * 100)}%</span> of
              the way to <span className={nextTier.color}>{nextTier.name}</span> tier!
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className={`${tier.color} fl-text-2xl/4xl font-bold`}>{tier.name}</span>
            <span className="fl-text-lg/2xl text-(--obs-text-muted)">Member</span>
            <span className="mt-4 max-w-56 text-balance text-center fl-text-sm/base text-(--obs-text-muted)">
              Level up to enjoy exclusive benefits!
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="fl-text-2xl/4xl font-bold text-[#19B5CA]">{points}</span>
            <span className="fl-text-lg/2xl text-(--obs-text-muted)">Points</span>
            <span className="mt-4 max-w-56 text-balance text-center fl-text-sm/base text-(--obs-text-muted)">
              Buy merch in the{" "}
              <a href="/store" className="obs-link underline">
                Store
              </a>
              !<br /> (Coming Soon)
            </span>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Header;
