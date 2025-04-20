import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

const ScrollArrow = ({ nextRef }: { nextRef: React.RefObject<HTMLDivElement> }) => {
  const [opacity, setOpacity] = useState(1);

  const scrollDown = () => {
    nextRef.current?.scrollIntoView({ behavior: "smooth" });
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
    <AnimatePresence>
      <motion.div
        className={`absolute bottom-5 left-1/2 -translate-x-1/2 cursor-pointer animate-bounce ${
          opacity === 0 && "hidden"
        }`}
        initial={{ y: 10 }}
        animate={{ y: [0, -10, 0] }}
        exit={{ y: 10 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeIn",
        }}
      >
        <IoIosArrowDown size={40} onClick={scrollDown} style={{ opacity }} />
      </motion.div>
    </AnimatePresence>
  );
};

export default ScrollArrow;
