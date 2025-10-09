import contact_dino from "../../Assets/Images/contact_dino.webp";
import projects_dino from "../../Assets/Images/projects_dino.webp";
import dino from "../../Assets/Images/dino_square.webp";
import { useStats } from "../../Hooks/Members/useStats";
import { useMemo } from "react";

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
