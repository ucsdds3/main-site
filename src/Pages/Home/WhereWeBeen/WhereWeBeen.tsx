import Carousel from "./Carousel";
import PeopleCarousel from "./PeopleCarousel";

const WhereWeBeen = () => {
  return (
    <div className="flex flex-col items-center gap-10 w-[90vw] lg:w-[80vw] py-[clamp(5rem,5vh,10rem)] font-albert-sans">
      <h2 className="text-[clamp(2.7rem,10vw,4rem)] text-center px-4">Where We've Been</h2>
      <PeopleCarousel />
      <Carousel />
    </div>
  );
};

export default WhereWeBeen;
