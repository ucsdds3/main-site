import { MdOpenInNew } from "react-icons/md";
import Section from "../../../Components/Section";
import { FaArrowRight } from "react-icons/fa6";
import { useState } from "react";
import { useSiteHandler } from "../../../Hooks/useSiteHandler";

const Events = () => {
  const [code, setCode] = useState("");
  const { navigate } = useSiteHandler();
  
  return (
    <Section className="flex flex-col lg:flex-row items-stretch justify-center pt-0">
      <div className="flex-5 flex flex-col bg-base-300 p-8 rounded-2xl">
        <h2 className="text-4xl font-bold">Attended Events</h2>
        <a
          onClick={() => {
            navigate({ pathname: "/events", subdomain: "main" });
          }}
          className="text-blue-400 underline cursor-pointer flex items-center text-lg"
        >
          Find Upcoming Events <MdOpenInNew />
        </a>
        <div className="flex size-full justify-center items-center gap-8 min-h-[200px]">
          <span className="text-2xl">You haven't attended any events</span>
        </div>
      </div>

      <div className="flex flex-col gap-8 w-full lg:w-1/4">
        <div className="flex flex-col bg-base-300 rounded-2xl p-8 gap-6">
          <h2 className="text-4xl font-bold">Event Check In</h2>
          <label className="input input-primary input-lg flex items-center justify-end">
            <input
              placeholder="Enter event code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button
              className="btn btn-primary btn-sm text-base"
              onClick={() => {
                // Handle click event
              }}
            >
              <FaArrowRight />
            </button>
          </label>
        </div>

        <div className="flex flex-col justify-between bg-base-300 p-8 rounded-2xl gap-6">
          <h2 className="text-4xl font-bold text-center">Event Stats</h2>
          <div className="grid grid-cols-2 grid-rows-3 gap-6">
            <span className="text-5xl text-center text-primary font-bold">0</span>
            <span className="text-xl text-center w-10">Events Attended</span>
            <span className="text-5xl text-center text-primary font-bold">100</span>
            <span className="text-xl text-center w-10">Points Attainable</span>
            <span className="text-5xl text-center text-primary font-bold">1000</span>
            <span className="text-xl text-center w-10">Experience Attainable</span>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Events;
