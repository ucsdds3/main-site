import { useRef } from "react";
import Page from "../Page/Page";
import Landing from "./Landing";
import About from "../../Components/About";
import projects from "../../Assets/Data/projects.json";
import ShowCase from "./ShowCase";
import Gallery from "../../Components/Gallery";
import { newArray } from "../../Utils/functions.tsx";

const Projects = () => {
  const scrollRef = useRef<HTMLDivElement>(null!);
  const fakeGallery = newArray(7, "").map(() =>
    Math.random() > 0.5 ? "" : "/main-site/GetInvolved/projects-img.jpeg"
  );

  return (
    <Page scrollRef={scrollRef}>
      <Landing />
      <div ref={scrollRef}>
        <About {...projects.about} />
        <ShowCase />
        <Gallery images={projects.images || fakeGallery} />
      </div>
    </Page>
  );
};

export default Projects;
