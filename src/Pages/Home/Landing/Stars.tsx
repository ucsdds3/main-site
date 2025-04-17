import { motion } from "framer-motion";
import { StarType } from "../../../Utils/types";
import StarData from "../../../Assets/Data/stars.ts";
import starImg from "../../../Assets/Images/Star.svg";
import { useTheme } from "../../../Store/useTheme.ts";

const Stars = ({ StarsArray }: { StarsArray: StarType[] }) => {
  const { isDark } = useTheme();

  return (
    <motion.div
      variants={StarData.appearingVariants}
      initial="initial"
      animate="animate"
      className="z-[-10]"
    >
      {StarsArray.map((star, index) => (
        <motion.div
          key={index}
          variants={StarData.appearingVariants}
          className="m-4 absolute"
          style={{ top: `${star.y}%`, left: `${star.x}%` }}
        >
          <motion.img
            src={starImg}
            variants={StarData.starVariants}
            initial="initial"
            animate="animate"
            transition={{
              delay: star.w * 0.1,
              duration: 8 + Math.floor(Math.random() * 4),
              repeat: Infinity,
            }}
            style={{
              width: `calc(${star.w}*clamp(1rem,1vw,2rem))`,
              opacity: isDark ? 1 : 0.8,
              filter: isDark
                ? "brightness(1) drop-shadow(0px 0px 8px white)"
                : "brightness(0) drop-shadow(0px 0px 4px rgba(0,0,0,0.5))",
            }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default Stars;
