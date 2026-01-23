import { useMemo } from "react";

import contact_dino from "src/Assets/Images/contact_dino.webp";
import projects_dino from "src/Assets/Images/projects_dino.webp";
import dino from "src/Assets/Images/dino_square.webp";

import { useStats } from "../Hooks/useStats";

const Avatar = () => {
  const { progress, tier } = useStats();

  const rand_dino = useMemo(() => {
    const dinos = [dino, contact_dino, projects_dino];
    return dinos[Math.floor(Math.random() * dinos.length)];
  }, []);

  return (
    <div
      className={`size-60 p-8 bg-base-300 radial-progress ${tier.color}`}
      style={{ "--value": progress * 100 } as React.CSSProperties}
    >
      {/* TODO: User profile picture instead of random dino */}
      <img src={rand_dino} alt="Dino" />
    </div>
  );
};

export default Avatar;
