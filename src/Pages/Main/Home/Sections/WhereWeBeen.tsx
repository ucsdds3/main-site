import Section from "src/Components/Page/Section";
import SlideshowCarousel from "src/Components/SlideshowCarousel";
import Carousel from "../Components/Carousel";
import cardData from "src/Assets/Data/testimonials.json";

const WhereWeBeen = () => {
  return (
    <Section title="Where We Are">
      <SlideshowCarousel images={cardData} />
      <Carousel />
    </Section>
  );
};

export default WhereWeBeen;
