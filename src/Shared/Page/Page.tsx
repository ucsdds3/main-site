import "simplebar-react/dist/simplebar.min.css";
import SimpleBar from "simplebar-react";

import { useTheme } from "src/Hooks/useTheme";
import sleepyDark from "src/Assets/Images/under_construction_dark.png";
import sleepyLight from "src/Assets/Images/under_construction_light.png";

import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollArrow from "./ScrollArrow";

interface PageProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  scrollRef?: React.RefObject<HTMLDivElement>;
}

const Page = ({ children, scrollRef, ...props }: PageProps) => {
  const { isDark } = useTheme();

  return (
    <SimpleBar className="absolute left-0 top-0 w-screen h-screen overflow-x-hidden">
      <Navbar />
      <div className="flex flex-col items-center min-h-[80vh]" {...props}>
        {scrollRef && <ScrollArrow ref={scrollRef} />}
        {children || (
          <>
            <h2 className="text-center hero-text-shadow my-10 text-[clamp(2rem,10vw,4rem)]">
              Coming Soon
            </h2>
            <img
              src={isDark ? sleepyDark : sleepyLight}
              alt="Under Construction"
              className="bear mt-[clamp(5rem,5vw,10rem)] w-[clamp(10rem,30vw,30rem)]"
            />
          </>
        )}
      </div>
      <Footer />
    </SimpleBar>
  );
};

export default Page;
