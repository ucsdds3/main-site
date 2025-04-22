import { useNavigate } from "react-router";
import Button from "../../../Components/Button";
import logo from "/src/Assets/Images/ds3_logo.png";

// &nbsp; is a non-breaking space
export default function Text() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center items-center md:items-start px-8 mt-[10vh] lg:mt-[20vh]" id="textarea">
      <div className="flex gap-2 font-albert-sans text-[clamp(1.1rem,3vw,2rem)]">
        <div className="text-[#F58134]">LEARN,</div>
        <div className="text-[#19B5CA]">BUILD,</div>
        <div className="text-[#A9A9A9]">INNOVATE</div>
        <span>WITH DATA</span>
      </div>

      <div className="flex items-center text-center md:text-left">
        <h1 className="text-[clamp(2.7rem,3.5vw,4rem)] font-medium font-albert-sans">
          Data&nbsp;Science Student&nbsp;Society
        </h1>
        <img src={logo} alt="Logo" className="h-[clamp(3rem,5vw,5rem)] hidden md:block" />
      </div>

      <p className="mt-2 text-[clamp(1rem,3vw,1.2rem)] pb-[clamp(1rem,3vw,2rem)] font-albert-sans text-center md:text-left">
        We are here to expand the horizons of data
        science&nbsp;as&nbsp;a&nbsp;community&nbsp;together.
      </p>
      <Button onClick={() => {navigate('/join-us')}}>JOIN US</Button>
    </div>
  );
}
