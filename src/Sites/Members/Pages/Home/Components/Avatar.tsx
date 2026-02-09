import { useMemo } from "react";

import contact_dino from "src/Assets/Images/contact_dino.webp";
import projects_dino from "src/Assets/Images/projects_dino.webp";
import dino from "src/Assets/Images/dino_square.webp";

import { useStats } from "../Hooks/useStats";
import { useAuthStore } from "../../../Hooks/useAuthStore";

const Avatar = () => {
  const { progress, tier } = useStats();
  const { user } = useAuthStore();

  const rand_dino = useMemo(() => {
    const dinos = [dino, contact_dino, projects_dino];
    return dinos[Math.floor(Math.random() * dinos.length)];
  }, []);

  const profilePicture = user?.user_metadata?.profile_picture;
  const avatarSrc = profilePicture || rand_dino;
  const avatarAlt = profilePicture ? "Profile picture" : "Dino";

  return (
    <div
      className={`size-60 p-8 bg-base-300 radial-progress ${tier.color}`}
      style={{ "--value": progress * 100 } as React.CSSProperties}
    >
      <img src={avatarSrc} alt={avatarAlt} />
    </div>
  );
};

export default Avatar;
