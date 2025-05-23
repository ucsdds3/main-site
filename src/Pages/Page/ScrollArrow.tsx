import { AnimatePresence, motion } from "framer-motion";
// import { useEffect, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { scrollTo } from "../../Utils/functions.tsx";

const ScrollArrow = ({ ref }: { ref: React.RefObject<HTMLDivElement> }) => {
  // const [opacity, setOpacity] = useState(1);

  // useEffect(() => {
  //   const scrollContainer = document.querySelector(".simplebar-content-wrapper");

  //   const handleScroll = () => {
  //     setOpacity(Math.max(0, 1 - (scrollContainer?.scrollTop || 0) / 500));
  //   };

  //   scrollContainer?.addEventListener("scroll", handleScroll);
  //   return () => scrollContainer?.removeEventListener("scroll", handleScroll);
  // }, []);

  return (
    <AnimatePresence>
      <motion.div
        className={`absolute bottom-5 left-1/2 -translate-x-1/2 cursor-pointer animate-bounce`}
        initial={{ y: 10 }}
        animate={{ y: [0, -10, 0] }}
        exit={{ y: 10 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeIn"
        }}
      >
        <IoIosArrowDown size={40} onClick={() => scrollTo(ref)} className="scroll-arrow" />
      </motion.div>
    </AnimatePresence>
  );
};

export default ScrollArrow;
