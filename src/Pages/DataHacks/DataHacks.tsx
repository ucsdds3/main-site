import { useRef } from "react";
import { newArray } from "../../Utils/functions.tsx";
import Page from "../Page/Page";
import Gallery from "../../Components/Gallery";
import datahacks from "../../Assets/Data/datahacks.json";
import About from "../../Components/About";
import ShowCase from "./ShowCase";
import Landing from "./Landing";

const DataHacks = () => {
  const scrollRef = useRef<HTMLDivElement>(null!);
  const DataHacksGallery = [
    "/main-site/DataHacks/D1.jpg",
    "/main-site/DataHacks/D2.jpg",
    "/main-site/DataHacks/D3.jpg",
    "/main-site/DataHacks/D4.jpg",
    "/main-site/DataHacks/D5.jpg",
    "/main-site/DataHacks/D6.jpeg",
    "/main-site/DataHacks/D7.jpg"
  ]

  return (
    <Page scrollRef={scrollRef}>
      <Landing />
      <div ref={scrollRef}>
        <About {...datahacks.about} />
        <ShowCase />
        <Gallery
          images={datahacks.images || DataHacksGallery}
          link="https://drive.google.com/drive/folders/1uHYeanJW0hPyiCUOcI7tPYQRlkWrJnsU"
        />
      </div>
    </Page>
  );
};

export default DataHacks;
