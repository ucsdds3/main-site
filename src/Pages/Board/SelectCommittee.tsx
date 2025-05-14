import { CommitteeType } from "../../Utils/types";
import { unbreakable } from "../../Utils/functions.tsx";
import committees from "../../Assets/Data/committees.json";
import Button from "../../Components/Button";
import Star from "../../Components/Star";
import { useNavigate } from "react-router";

interface SelectCommitteeProps {
  committee: CommitteeType;
  setCommittee: (committee: CommitteeType) => void;
}

const SelectCommittee = ({ committee, setCommittee }: SelectCommitteeProps) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex flex-col lg:sticky top-40 gap-6 h-fit mb-10">
        <div className="flex flex-col gap-2 w-fit">
          <h2 className="text-2xl font-medium w-fit mx-2">Committees:</h2>
          <div className="h-[1px] bg-(--color-primary) glow" />
        </div>

        <ul className="flex flex-col gap-3">
          {Object.keys(committees).map((committee, index) => (
            <li key={index} className="flex items-center gap-3">
              <input
                type="radio"
                id={`committee-${index}`}
                name="committeeSelector"
                className="radio radio-primary"
                defaultChecked={index === 0}
                onClick={() => setCommittee(committee as CommitteeType)}
              />
              <label htmlFor={`committee-${index}`} className="cursor-pointer text-2xl">
                {unbreakable(committee)}
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
        <span className="fieldset-legend text-lg">Committee</span>
        <select
          value={committee}
          className="select select-primary select-lg"
          onChange={(e) => setCommittee(e.target.value as CommitteeType)}
        >
          {Object.keys(committees as object).map((committee, index) => (
            <option key={index}>{committee}</option>
          ))}
        </select>
      </fieldset>
    </>
  );
};

export default SelectCommittee;
