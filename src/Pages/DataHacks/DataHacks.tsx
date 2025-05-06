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
  const fakeGallery = newArray(7, "").map(() =>
    Math.random() > 0.5 ? "" : "/main-site/GetInvolved/datahacks_2.jpeg"
  );

  return (
    <Page scrollRef={scrollRef}>
      <Landing />
      <div ref={scrollRef}>
        <Suspense>
          <About {...datahacks.about} />
          <ShowCase />
          <Gallery
            images={datahacks.images || fakeGallery}
            link="https://drive.google.com/drive/folders/1uHYeanJW0hPyiCUOcI7tPYQRlkWrJnsU"
          />
        </Suspense>
      </div>
    </Page>
  );
};

export default DataHacks;
