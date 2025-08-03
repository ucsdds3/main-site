import { unbreakable } from "../../Utils/functions.tsx";
import teams from "../../Assets/Data/teams.json";
import Button from "../../Components/Button.tsx";
import Star from "../../Components/Star.tsx";
import { useNavigate } from "react-router";

interface SelectTeamProps {
  team: string;
  setTeam: (team: string) => void;
}

const SelectTeam = ({ team, setTeam }: SelectTeamProps) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex flex-col top-40 gap-6 h-fit mb-10">
        <div className="flex flex-col gap-2 w-fit">
          <h2 className="text-2xl font-medium w-fit mx-2">Teams:</h2>
          <div className="h-[1px] bg-(--color-primary) glow" />
        </div>

        <ul className="flex flex-col gap-3">
          {Object.keys(teams).map((team, index) => (
            <li key={index} className="flex items-center gap-3">
              <input
                type="radio"
                id={`team-${index}`}
                name="teamSelector"
                className="radio radio-primary"
                defaultChecked={index === 0}
                onClick={() => setTeam(team)}
              />
              <label htmlFor={`team-${index}`} className="cursor-pointer text-2xl">
                {unbreakable(team)}
              </label>
            </li>
          ))}
        </ul>

        <Button
          onClick={() => {
            navigate("/join-us");
          }}
        >
          JOIN US
        </Button>

        <div className="relative h-[40px]">
          <Star size={1.4} className="absolute top-0 left-3/8" />
          <Star size={1.2} className="absolute bottom-0 right-1/4" />
        </div>
      </div>

      {/* Mobile */}
      <fieldset className="lg:hidden fieldset w-[clamp(20rem,40vw,30rem)] flex flex-col items-center">
        <span className="fieldset-legend text-lg">Team</span>
        <select
          value={team}
          className="select select-primary select-lg"
          onChange={(e) => setTeam(e.target.value)}
        >
          {Object.keys(teams as object).map((team, index) => (
            <option key={index}>{team}</option>
          ))}
        </select>
      </fieldset>
    </>
  );
};

export default SelectTeam;
