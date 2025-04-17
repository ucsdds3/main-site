import Button from "../../../Components/Button";
import { useTheme } from "../../../Store/useTheme";
import logo from "/src/Assets/Images/ds3_logo.png";

export default function Text() {
  const { isDark } = useTheme();

  return (
    <div
      className="flex flex-col justify-center mt-[10vh] md:mt-[20vh]"
      id="textarea"
    >
      <div className="">
        <div
          className={`flex ${
            isDark ? "text-white" : "text-black"
          } lg:text-[2vw] leading-[2vw] ml-[-0.1rem] font-albert-sans`}
        >
          <div className="text-[#F58134]">LEARN</div>,
          <div className="text-[#19B5CA] ml-[0.5rem]">BUILD</div>,
          <div className="text-[#A9A9A9] ml-[0.5rem] mr-2">INNOVATE</div>
          <span className={`${isDark ? "text-white" : "text-black"}`}>
            WITH DATA
          </span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center">
            <p
              className={`lg:text-[4vw] text-[8.5vw] ${
                isDark ? "text-white" : "text-black"
              } font-medium font-albert-sans leading-tight`}
            >
              Data Science
            </p>
            <img
              src={logo}
              alt="Logo"
              className="-scale-x-100 w-12 object-contain ml-2 hidden md:block"
            />
          </div>
          <p
            className={`lg:text-[4vw] text-[8.5vw] ${
              isDark ? "text-white" : "text-black"
            } font-medium font-albert-sans leading-tight`}
          >
            Student Society
          </p>
        </div>

        <div
          className={`mt-1 md:text-[1.5vw] text-[5vw] sm:text-[3vw] pb-10 font-albert-sans ${
            isDark ? "text-white" : "text-black"
          }`}
        >
          We are here to expand the horizons of data science as a community
          together.
        </div>
        <Button contents="JOIN US" onClick={() => {}} />
      </div>
    </div>
  );
}
