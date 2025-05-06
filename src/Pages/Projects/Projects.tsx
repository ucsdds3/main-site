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
  const fakeGallery = [
    "/main-site/Projects/P1.jpeg",
    "/main-site/Projects/P2.jpg",
    "/main-site/Projects/P3.jpg",
    "/main-site/Projects/P4.jpg",
    "/main-site/Projects/P5.jpg",
    "/main-site/Projects/P6.jpg",
    "/main-site/Projects/P7.jpg"
  ]
  

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
