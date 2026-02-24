import { motion } from "framer-motion";
import { useNavigate } from "react-router";

import { useTheme } from "src/Hooks/useTheme";
import Button from "src/Shared/Components/Button";
import DotGrid from "../Components/DotGrid";

const Landing = () => {
  const navigate = useNavigate();
  const { primaryColor, oppositeColor } = useTheme();

  return (
    <div className="flex flex-col items-center w-[95vw] min-h-[95vh] mx-auto" id="home">
      <div
        style={{
          width: "100vw",
          height: "110vh",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: -5,
        }}
      >
        <DotGrid
          dotSize={5}
          gap={25}
          baseColor={`${oppositeColor}20`}
          activeColor={primaryColor}
          proximity={75}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

      <div className="flex flex-col justify-center items-center px-8 mt-[29vh]" id="textarea">
        <div className="flex gap-2 font-albert-sans text-[clamp(1.2rem,4vw,2.5rem)] font-semibold uppercase">
          <div className="text-[#F58134]">LEARN,</div>
          <div className="text-[#19B5CA]">BUILD,</div>
          <div className="text-[#A9A9A9]">INNOVATE</div>
          <span>WITH DATA</span>
        </div>

        <div className="flex items-center text-center">
          <h1 className="text-[clamp(2.7rem,4.5vw,4rem)] font-semibold md:overflow-hidden title-short md:text-nowrap">
            Data Science Student Society
          </h1>
          <h1 className="text-[clamp(2.7rem,4.5vw,4rem)] font-semibold md:block hidden title-long md:overflow-hidden">
            DS3
          </h1>
          <img
            src="/logo.webp"
            alt="Logo"
            className="h-[clamp(3rem,5vw,5rem)] hidden md:block caret"
          />
        </div>
        <p className="mt-2 text-[clamp(1rem,3.5vw,2rem)] pb-[clamp(1rem,3vw,2rem)] font-albert-sans text-center">
          Expanding the horizons of data science through community, curiosity, and collaboration.
        </p>
        <Button
          onClick={() => {
            navigate("/join-us");
          }}
        >
          JOIN US
        </Button>
      </div>
    </div>
  );
};

export default Landing;
