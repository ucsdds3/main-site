import logo from "/src/Assets/Images/ds3_logo.png";
import socialMedia from "../../Assets/Data/socialMedia.tsx";

const Footer = () => {
  return (
    <footer
      className="border-t border-(--color-primary) flex flex-col lg:flex-row items-center justify-between gap-6 py-8 bg-[#0E1111]"
      data-theme="dark"
    >
      <div className="flex px-6 flex-1 gap-3 ">
        <div className="flex items-center gap-3">
          <img src={logo} alt="DS3 Logo" className="w-12" />
          <div className="flex flex-col">
            <span className="text-2xl font-semibold">DS3 @ UC SAN DIEGO</span>
            <span className="text-sm text-gray-400">© 2025 All Rights Reserved</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center items-center px-6 gap-4">
        {socialMedia.map((media, index) => (
          <a
            key={index}
            title={media.title}
            href={media.link}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-(--color-primary) transition-all duration-300 btn rounded-full text-white text-xl w-14 h-14 p-0 border-none bg-[#202020] hover:bg-[#282828]"
          >
            {media.icon}
          </a>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
