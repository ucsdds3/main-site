import { useNavigate } from "react-router";

interface BrowserCardProps {
  title: string;
  imageSrc: string;
  description: string;
  link: string;
}

const BrowserCard = ({ title, imageSrc, description, link }: BrowserCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      className="relative w-full h-full p-4 rounded-lg border-2 hover:border-(--color-primary) cursor-pointer duration-250 flex flex-col gap-2 group"
      onClick={() => navigate(link.replace("www.ds3ucsd.com", ""))}
    >
      <div className="absolute top-6 right-6 flex gap-2">
        <span className="w-3 h-3 bg-[#F58134] rounded-full" />
        <span className="w-3 h-3 bg-[#11B3C9] rounded-full" />
        <span className="w-3 h-3 bg-[#434343] rounded-full" />
      </div>
      <span className="w-[80%] h-6 px-4 truncate rounded-full bg-base-300 hover:underline">
        {link}
      </span>
      <h4
        className="text-2xl font-normal pl-2"
        style={{ fontFamily: "'Albert Sans', sans-serif", lineHeight: "45px" }}
      >
        {title}
      </h4>
      <div className="group overflow-hidden rounded-md">
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-[300px] object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <p
        className="text-lg"
        style={{
          fontFamily: "'Albert Sans', sans-serif",
        }}
      >
        {description}
      </p>
    </div>
  );
};

export default BrowserCard;
