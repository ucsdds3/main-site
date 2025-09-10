import contact_dino from "../../../Assets/Images/contact_dino.webp";
import projects_dino from "../../../Assets/Images/projects_dino.webp";
import dino from "../../../Assets/Images/dino_square.webp";

import Section from "../../../Components/Section";
import { useAuthStore } from "../../../Hooks/Auth/useAuthStore";

const Header = () => {
  const tiers = {
    Rookie: "text-primary", // 0 - 1000 xp
    Bronze: "text-yellow-700", // 1000 - 2000 xp
    Silver: "text-gray-400", // 2000 - 4000 xp
    Gold: "text-yellow-300", // 4000 - 8000 xp
    Platinum: "text-secondary", // 8000 - 16000 xp
  };

  const { user } = useAuthStore();
  const xp = user?.user_metadata.experience || 0;
  const dinos = [dino, contact_dino, projects_dino];
  const rand_dino = dinos[Math.floor(Math.random() * dinos.length)];

  const level = Math.max(Math.floor(Math.log2(xp / 1000)) + 1, 0);
  const offset = Number(xp >= 1000);
  const xpNeeded = 1000 * Math.pow(2, level - offset);
  const progress = xp / xpNeeded - offset;
  const [tier, color] = Object.entries(tiers)[level];

  return (
    <Section className="flex-row items-center justify-center">
      <div
        className={`size-60 p-8 bg-base-300 radial-progress ${color}`}
        style={{ "--value": progress * 100 } as React.CSSProperties}
      >
        <img src={rand_dino} alt="Dino" />
      </div>

      <div className="flex-1 h-68 p-8 rounded-2xl bg-base-300 flex flex-col gap-8">
        <h1 className="text-4xl font-bold">
          Welcome Back,{" "}
          <span className="text-primary">{user?.user_metadata.full_name}</span>
          . Here are your stats:
        </h1>

        <div className="flex size-full justify-around items-center">
          <div className="flex flex-col items-center">
            <span className="text-primary text-5xl font-bold">
              {xp} / {xpNeeded}
            </span>
            <span className="text-3xl">XP</span>
            <span className="mt-4 text-lg">
              You're <span className="text-primary">{progress * 100}%</span> of
              the way to{" "}
              <span className={`${Object.values(tiers)[level + 1]}`}>
                {Object.keys(tiers)[level + 1]}
              </span>{" "}
              tier!
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className={`${color} text-5xl font-bold`}>{tier}</span>
            <span className="text-3xl">Member</span>
            <span className="mt-4 text-lg">Level up to enjoy exclusive benefits!</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-primary text-5xl font-bold">
              {user?.user_metadata.points || 0}
            </span>
            <span className="text-3xl">Points</span>
            <span className="mt-4 text-lg">
              Buy merch in the{" "}
              <a
                href="/store"
                className="text-blue-400 cursor-pointer underline"
              >
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
