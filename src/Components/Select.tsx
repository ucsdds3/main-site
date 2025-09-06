import { twMerge } from "tailwind-merge";

interface SelectProps {
  label: string;
  options: string[];
  error?: boolean;
  icon?: React.ReactNode;
  className?: string;
  value?: string;
  setValue?: (value: string) => void;
}

const Select = ({ label, error, icon, className, options, value, setValue }: SelectProps) => {
  return (
    <div className={twMerge(`flex flex-col gap-2 min-w-[300px] w-[300px]`, className)}>
      <span className="text-lg">
        {label}
      </span>
      <label className={`select select-lg ${error ? "select-error" : "select-primary"}`}>
        {icon}
        <select value={value} onChange={(e) => setValue && setValue(e.target.value)}>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default Select;
