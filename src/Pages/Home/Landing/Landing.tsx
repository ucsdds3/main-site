import { motion } from "framer-motion";
import TextArea from "./TextArea";
import dino from "/src/Assets/Images/dino.png";
import starData from "../../../Assets/Data/stars.json";
import Star from "../../../Components/Star";

const Landing = () => {
  const stars = starData.positions[Math.round(Math.random() * 4)];

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start w-[95vw] min-h-[95vh] mx-auto">
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

      <TextArea />

      <img
        src={dino}
        className="w-[clamp(20rem,40vw,30rem)] lg:w-[clamp(18rem,28vw,40rem)] h-fit mt-[clamp(5rem,10vw,10rem)] lg:mt-auto p-16 mb-10 mx-auto lg:mx-0 rotate-15"
      />
    </div>
  );
};

export default Landing;
