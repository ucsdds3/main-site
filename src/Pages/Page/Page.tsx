import "simplebar-react/dist/simplebar.min.css";
import SimpleBar from "simplebar-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import bear from "/src/Assets/Images/Sleepy_Bear.png";

interface PageProps {
  children?: React.ReactNode;
}

const Page = ({ children }: PageProps) => {
  return (
    <SimpleBar className="absolute left-0 top-0 w-screen h-screen overflow-x-hidden">
      <Navbar />
      <div className="flex flex-col items-center min-h-[80vh]">
        {children || (
          <>
            <h2 className="text-center hero-text-shadow my-10 text-[clamp(2rem,10vw,4rem)]">
              Coming Soon
            </h2>
            <img
              src={bear}
              alt="Under Construction"
              className="bear mt-[clamp(5rem,5vw,10rem)] w-[clamp(20rem,60vw,65rem)]"
            />
          </>
        )}
      </div>
      <Footer />
    </SimpleBar>
  );
};

export default Page;
