import { motion } from "framer-motion";
import starData from "../../../Assets/Data/stars.json";
import starImg from "../../../Assets/Images/Star.svg";
import { useTheme } from "../../../Hooks/useTheme.ts";

const Stars = () => {
  const { isDark } = useTheme();
  const stars = starData.positions[Math.round(Math.random() * 4)];

  return (
    <motion.div
      variants={starData.appearingVariants}
      initial="initial"
      animate="animate"
      className="z-[-10]"
    >
      {stars.map((star, index) => (
        <motion.div
          key={index}
          variants={starData.appearingVariants}
          className="m-4 absolute"
          style={{ top: `${star.y}%`, left: `${star.x}%` }}
        >
          <motion.img
            src={starImg}
            variants={starData.starVariants}
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
