import { lazy, Suspense } from "react";

import Page from "src/Shared/Page/Page.tsx";
import datahacks from "./Data/datahacks.json";
import Landing from "./Sections/Landing.tsx";

const About = lazy(() => import("../../Components/About.tsx"));
const Gallery = lazy(() => import("../../Components/Gallery.tsx"));
const ShowCase = lazy(() => import("./Sections/ShowCase.tsx"));

const DataHacks = () => {
  return (
    <Page>
      <Landing />
      <div className="w-full flex flex-col items-center">
        <Suspense>
          <About {...datahacks.about} />
          <ShowCase />
          <Gallery
            images={datahacks.images}
            link="https://drive.google.com/drive/folders/1uHYeanJW0hPyiCUOcI7tPYQRlkWrJnsU"
          />
        </Suspense>
      </div>
    </Page>
  );
};

export default DataHacks;
