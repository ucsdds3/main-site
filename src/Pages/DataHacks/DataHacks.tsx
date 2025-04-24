import { useRef } from "react";
import { newArray } from "../../Utils/functions";
import Page from "../Page/Page";
import Gallery from "../../Components/Gallery";
import datahacks from "../../Assets/Data/datahacks.json";
import About from "../../Components/About";
import ShowCase from "./ShowCase";
import Landing from "./Landing";

const DataHacks = () => {
  const scrollRef = useRef<HTMLDivElement>(null!);
  const fakeGallery = newArray(7, "").map(() =>
    Math.random() > 0.5 ? "" : "/main-site/GetInvolved/datahacks_2.jpeg"
  );

  return (
    <Page scrollRef={scrollRef}>
      <Landing />
      <div ref={scrollRef}>
        <About {...datahacks.about} />
        <ShowCase />
        <Gallery
          images={datahacks.images || fakeGallery}
          link="https://drive.google.com/drive/folders/1uHYeanJW0hPyiCUOcI7tPYQRlkWrJnsU"
        />
      </div>
    </Page>
  );
};

export default DataHacks;
