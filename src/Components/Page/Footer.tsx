import SocialMedia from "./SocialMedia";
import logo from "/src/Assets/Images/ds3_logo.png";
// import Sponsers from "./Sponsers";

const Footer = () => {
  return (
    <div className="border-t border-[--border-color] flex py-8 bg-[#181818]">
      <div className="flex px-6 flex-1 gap-3 ">
        <div className="flex items-center">
          <img
            src={logo}
            alt="DS3 Logo"
            className="w-12"
          />
          <span className="ml-2 text-white text-2xl font-semibold">
            DS3 @ UC SAN DIEGO
          </span>
        </div>
      </div>
      <SocialMedia />
    </div>
  );
};

export default Footer;
