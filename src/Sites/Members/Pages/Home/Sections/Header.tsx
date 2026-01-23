import Section from "src/Shared/Page/Section";

import { useAuthStore } from "../../../Hooks/useAuthStore";
import { useStats } from "../Hooks/useStats";
import Avatar from "../Components/Avatar";

const Header = () => {
  const { user } = useAuthStore();
  const { xp, xpNeeded, progress, tier, nextTier } = useStats();

  return (
    <Section className="flex-row flex-wrap items-center justify-center">
      <Avatar />
      <div className="flex-1 min-h-68 p-8 rounded-2xl bg-base-300 flex flex-col gap-8">
        <h1 className="text-[clamp(1.5rem,2vw,2.25rem)] font-bold">
          Welcome Back, <span className="text-primary">{user?.user_metadata.full_name}</span>. Here
          are your stats:
        </h1>

        <div className="flex size-full justify-around items-center min-w-[min(50vw,400px)]">
          <div className="flex flex-col items-center">
            <span className="text-primary text-[clamp(1.5rem,2.5vw,3rem)] font-bold">
              {xp} / {xpNeeded}
            </span>
            <span className="text-[clamp(1.25rem,2vw,1.875rem)]">XP</span>
            <span className="mt-4 text-[clamp(0.7rem,1.1vw,1.125rem)] text-balance text-center">
              You're <span className="text-primary">{progress * 100}%</span> of the way to{" "}
              <span className={nextTier.color}>{nextTier.name}</span> tier!
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className={`${tier.color} text-[clamp(1.5rem,2.5vw,3rem)] font-bold`}>
              {tier.name}
            </span>
            <span className="text-[clamp(1.25rem,2vw,1.875rem)]">Member</span>
            <span className="mt-4 text-[clamp(0.7rem,1.1vw,1.125rem)] text-balance text-center">
              Level up to enjoy exclusive benefits!
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-primary text-[clamp(1.5rem,2.5vw,3rem)] font-bold">
              {user?.user_metadata.points || 0}
            </span>
            <span className="text-[clamp(1.25rem,2vw,1.875rem)]">Points</span>
            <span className="mt-4 text-[clamp(0.7rem,1.1vw,1.125rem)] text-balance text-center">
              Buy merch in the{" "}
              <a href="/store" className="text-blue-400 cursor-pointer underline">
                Store
              </a>
              !
            </span>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Header;
