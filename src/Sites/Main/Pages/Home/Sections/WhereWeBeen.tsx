import Section from "src/Shared/Page/Section";

import Carousel from "../Components/Carousel";
import SlideshowCarousel from "../Components/SlideshowCarousel";
import cardData from "../Data/testimonials.json";

const WhereWeBeen = () => {
  return (
    <Section title="Where We Are">
      <SlideshowCarousel images={cardData} />
      <Carousel />
    </Section>
  );
};

export default WhereWeBeen;
