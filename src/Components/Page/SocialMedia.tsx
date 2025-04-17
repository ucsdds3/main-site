import { FaDiscord, FaSpotify, FaInstagram } from "react-icons/fa6";
import { FaMedium } from "react-icons/fa";

const SocialMedia = () => {
  const btnClass =
    "btn rounded-full text-white text-lg w-12 p-0 border-none bg-[#202020] hover:bg-[#282828] glow";

  return (
    <div
      id="social-media-links"
      className="flex flex-col flex-1 items-end justify-center gap-y-8"
    >
      <div className="flex justify-end items-center w-[20vw] px-6 gap-2">
        <button
          onClick={() => window.open("https://discord.gg/fbnAP848V9", "_blank")}
          className={btnClass}
          title={"Discord"}
        >
          <FaInstagram />
        </button>
        <button
          onClick={() => window.open("mailto:ds3@ucsd.edu", "_blank")}
          className={btnClass}
          title={"Mail"}
        >
          <FaDiscord />
        </button>
        <button
          onClick={() =>
            window.open("https://github.com/TheBoyRoy05/", "_blank")
          }
          className={btnClass}
          title={"Github"}
        >
          <FaMedium />
        </button>
        <button
          onClick={() =>
            window.open("https://www.linkedin.com/in/issacroy/", "_blank")
          }
          className={btnClass}
          title={"LinkedIn"}
        >
          <FaSpotify />
        </button>
      </div>
    </div>
  );
};

export default SocialMedia;
