import { motion, AnimatePresence } from "framer-motion";
import dino from "/src/Assets/Images/dino.png";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../../Store/useTheme";
import StarData from "../../../Assets/Data/stars";
import { IoIosArrowDown } from "react-icons/io";
import Stars from "./Stars";
import TextArea from "./TextArea";

const Landing = ({ nextSectionRef }: { nextSectionRef: React.RefObject<HTMLDivElement> }) => {
  const { isDark } = useTheme();
  const [opacity, setOpacity] = useState(1);
  const starState = useRef(Math.round(Math.random() * 4));

  const scrollDown = () => {
    nextSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const scrollContainer = document.querySelector(".simplebar-content-wrapper");

    const handleScroll = () => {
      setOpacity(Math.max(0, 1 - (scrollContainer?.scrollTop || 0) / 500));
    };

    scrollContainer?.addEventListener("scroll", handleScroll);
    return () => scrollContainer?.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row justify-between  items-start w-[95vw] min-h-[90vh] mx-auto">
      <Stars StarsArray={StarData.positions[starState.current]} />
      <TextArea />
      <img
        src={dino}
        className="w-[clamp(20rem,40vw,30rem)] lg:w-[clamp(18rem,28vw,40rem)] h-fit mt-auto mx-auto lg:mx-0 rotate-15"
      />

      {/* Scroll Indicator Arrow */}
      <AnimatePresence>
        {opacity && (
          <motion.div
            className="absolute bottom-5 left-1/2 transform -translate-x-1/2 cursor-pointer"
            initial={{ opacity, y: 10 }}
            animate={{ opacity: 1, y: [0, -10, 0] }}
            exit={{ opacity: 0, y: 10 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeIn",
            }}
          >
            <IoIosArrowDown size={40} color={isDark ? "white" : "black"} onClick={scrollDown} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Landing;
