import dino from "/src/Assets/Images/dino.png";
import Stars from "./Stars";
import TextArea from "./TextArea";
import ScrollArrow from "../../../Components/ScrollArrow";

const Landing = ({ nextRef }: { nextRef: React.RefObject<HTMLDivElement> }) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start w-[95vw] min-h-[95vh] mx-auto">
      <Stars />
      <TextArea />
      <img
        src={dino}
        className="w-[clamp(20rem,40vw,30rem)] lg:w-[clamp(18rem,28vw,40rem)] h-fit mt-[clamp(5rem,10vw,10rem)] lg:mt-auto mb-10 mx-auto lg:mx-0 rotate-15"
      />
      <ScrollArrow nextRef={nextRef} />
    </div>
  );
};

export default Landing;
