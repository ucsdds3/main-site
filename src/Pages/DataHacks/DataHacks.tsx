import { lazy, Suspense, useRef } from "react";
import { newArray } from "../../Utils/functions.tsx";
import Page from "../Page/Page";
import datahacks from "../../Assets/Data/datahacks.json";

import Landing from "./Landing";
const About = lazy(() => {
  return import("../../Components/About");
});
const ShowCase = lazy(() => {
  return import("./ShowCase.tsx");
});
const Gallery = lazy(() => {
  return import("../../Components/Gallery");
});
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
        <Suspense>
          <About {...datahacks.about} />
          <ShowCase />
          <Gallery
            images={datahacks.images || DataHacksGallery}
            link="https://drive.google.com/drive/folders/1uHYeanJW0hPyiCUOcI7tPYQRlkWrJnsU"
          />
        </Suspense>
      </div>
    </Page>
  );
};

export default DataHacks;
