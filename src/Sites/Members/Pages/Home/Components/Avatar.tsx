import { useMemo, useRef } from "react";

import contact_dino from "src/Assets/Images/contact_dino.webp";
import projects_dino from "src/Assets/Images/projects_dino.webp";
import dino from "src/Assets/Images/dino_square.webp";
import Button from "src/Shared/Components/Button";

import { useHeaderStats } from "../Hooks/useHeaderStats";
import { useAuthStore } from "../../../Hooks/useAuthStore";
import { useUploadPFP } from "../../Profile/Hooks/useUploadPFP";

interface AvatarProps {
  updatable?: boolean;
  data?: Record<string, unknown>;
  setData?: (data: Record<string, unknown>) => void;
}

const Avatar = ({ updatable = false, data, setData }: AvatarProps) => {
  const { progress, tier } = useHeaderStats();
  const { user } = useAuthStore();
  const { handleAvatarUpload, handleClearPFP, uploadingAvatar } = useUploadPFP();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rand_dino = useMemo(() => {
    const dinos = [dino, contact_dino, projects_dino];
    return dinos[Math.floor(Math.random() * dinos.length)];
  }, []);

  const profilePicture = user?.user_metadata?.profile_picture;
  const avatarSrc = profilePicture || rand_dino;
  const avatarAlt = profilePicture ? "Profile picture" : "Dino";

  const handleClick = () => {
    if (updatable && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && data && setData) {
      handleAvatarUpload(file, data, setData);
    }
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      <div
        className={`size-68 relative aspect-square shrink-0 overflow-hidden border border-(--obs-border) bg-(--obs-surface) p-2 radial-progress after:bg-transparent ${tier.color} ${
          updatable && !uploadingAvatar ? "cursor-pointer" : ""
        }`}
        style={{ "--value": progress * 100 } as React.CSSProperties}
        onClick={handleClick}
      >
        <div className="absolute inset-2 rounded-full overflow-hidden aspect-square">
          <img
            src={avatarSrc}
            alt={avatarAlt}
            className="size-full object-cover object-center relative z-0"
          />
        </div>
        {updatable && (
          <div className="absolute bottom-0 left-0 right-0 h-[20%] bg-black/50 text-white text-2xl text-center pt-2 z-10">
            Edit
          </div>
        )}
      </div>
      {updatable && profilePicture && data && setData && (
        <Button
          onClick={() => {
            if (confirm("Are you sure you want to remove your profile picture?")) {
              handleClearPFP(data, setData);
            }
          }}
        >
          Clear Profile Picture
        </Button>
      )}
      {updatable && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      )}
    </div>
  );
};

export default Avatar;
