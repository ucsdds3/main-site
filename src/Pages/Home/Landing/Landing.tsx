import { motion, AnimatePresence } from "framer-motion";
import dino from "/src/Assets/Images/dino.png";
import { useEffect, useState } from "react";
import { useTheme } from "../../../Store/useTheme";
import StarData from "../../../Assets/Data/stars";
import Stars from "./Stars";
import TextArea from "./TextArea";

const Landing = ({ aboutUsRef }: { aboutUsRef: React.RefObject<HTMLDivElement> }) => {
  const [showArrow, setShowArrow] = useState(true);
  const { isDark } = useTheme();

  // Animation variants for the dinosaur
  const dinoVariants = {
    initial: {
      x: 0,
      y: 0,
      rotate: 15,
      scaleX: 1,
    },
    hover: {
      x: [0, -80, -80, -80, 60, 60, 60, 0], // Move further left and right
      y: [0, -30, 0, 0, -30, 0, 0, 0], // Jump up and down with movement
      rotate: [15, 15, 15, 15, -10, -10, -10, 15], // Reduced rotation angle when facing right
      scaleX: [1, 1, 1, -1, -1, -1, 1, 1], // Direction changes
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.15, 0.25, 0.35, 0.65, 0.75, 0.85, 1],
      },
    },
  };

  const handleScroll = () => {
    if (aboutUsRef.current) {
      aboutUsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Show/hide arrow based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Hide arrow after scrolling beyond 50px (adjust as needed)
      if (scrollY > 50) {
        setShowArrow(false);
      } else {
        setShowArrow(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col lg:w-[80vw] w-[95vw] min-h-[90vh] mx-auto">
      <Stars StarsArray={StarData.positions[Math.round(Math.random() * 4)]} />
      <TextArea />

      {/* Dino Image */}
      <div className="absolute bottom-[35vh] md:bottom-[0vh] right-[0.5vw] w-[400px] md:w-[500px] lg:w-[800px] 2xl:w-[1050px] h-1/2">
        <motion.img
          src={dino}
          alt=""
          className="absolute w-[70%] md:w-1/2 right-10 bottom-10 cursor-pointer"
          variants={dinoVariants}
          initial="initial"
          whileHover="hover"
          style={{ transformOrigin: "center" }}
        />
      </div>

      {/* Scroll Indicator Arrow */}
      <AnimatePresence>
        {showArrow && (
          <motion.div
            className="absolute bottom-5 left-1/2 transform -translate-x-1/2 cursor-pointer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.5 }}
          >
            <svg
              onClick={handleScroll}
              xmlns="http://www.w3.org/2000/svg"
              className={`h-8 w-8 ${isDark ? "text-white" : "text-black"} animate-bounce`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Landing;
