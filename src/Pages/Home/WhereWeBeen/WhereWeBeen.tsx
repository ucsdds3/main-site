import Section from "../../../Components/Section";
import SlideshowCarousel from "../../../Components/SlideshowCarousel";
import Carousel from "./Carousel";
import cardData from "../../../Assets/Data/testimonials.json";
const WhereWeBeen = () => {
  return (
    <Section title="Where We Are">
      <SlideshowCarousel images={cardData} />
      <Carousel />
    </Section>
  );
};

export default WhereWeBeen;
