import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import dino from "/src/Assets/Images/dino.webp";
import logo from "/src/Assets/Images/ds3_logo.webp";
import starData from "src/Assets/Data/stars.json";
import Star from "src/Components/Star";
import Button from "src/Components/Button";

const Landing = () => {
  const navigate = useNavigate();
  const stars = starData.positions[Math.round(Math.random() * 4)];

  return (
    <div className="flex flex-col lg:flex-row  items-start w-[95vw] min-h-[95vh] mx-auto" id="home">
      <motion.div variants={starData.appearingVariants} animate="animate" className="-z-1">
        {stars.map((star, index) => (
          <Star
            key={index}
            size={star.w}
            className="absolute"
            style={{ top: `${star.y}%`, left: `${star.x}%` }}
          />
        ))}
      </motion.div>

      <div
        className="flex flex-col justify-center items-center md:items-start px-8 mt-[10vh] lg:mt-[20vh]"
        id="textarea"
      >
        <div className="flex gap-2 font-albert-sans text-[clamp(1rem,3vw,2rem)]">
          <div className="text-[#F58134]">LEARN,</div>
          <div className="text-[#19B5CA]">BUILD,</div>
          <div className="text-[#A9A9A9]">INNOVATE</div>
          <span>WITH DATA</span>
        </div>

        <div className="flex items-center text-center md:text-left">
          <h1 className="text-[clamp(2.7rem,4.5vw,4rem)] font-semibold md:overflow-hidden title-short md:text-nowrap">
            Data Science Student Society
          </h1>
          <h1 className="text-[clamp(2.7rem,4.5vw,4rem)] font-semibold md:block hidden title-long md:overflow-hidden">
            DS3
          </h1>
          <img src={logo} alt="Logo" className="h-[clamp(3rem,5vw,5rem)] hidden md:block caret" />
        </div>
        <p className="mt-2 text-[clamp(1rem,3.5vw,2rem)] pb-[clamp(1rem,3vw,2rem)] font-albert-sans text-center md:text-left">
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

      <motion.img
        src={dino}
        className="w-[70vw] max-w-[30rem] mx-auto mb-6 md:w-[clamp(20rem,40vw,30rem)] md:absolute md:right-0 md:bottom-0 md:mb-10 md:mx-0 lg:w-[clamp(18rem,28vw,40rem)] lg:mt-auto p-16"
        animate={{
          y: [0, -20, 0],
          rotate: [15, 10, 15],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

export default Landing;
