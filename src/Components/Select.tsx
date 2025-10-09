import { twMerge } from "tailwind-merge";

interface SelectProps {
  label: string;
  options: string[];
  error?: boolean;
  icon?: React.ReactNode;
  required?: boolean;
  className?: string;
  value?: string;
  setValue?: (value: string) => void;
}

const Select = ({
  label,
  error,
  icon,
  className,
  required,
  options,
  value,
  setValue,
}: SelectProps) => {
  return (
    <div className={twMerge(`flex flex-col gap-2 min-w-[300px]`, className)}>
      <span className="text-lg">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <label className={`select w-full select-lg ${error ? "select-error" : "select-primary"}`}>
        {icon}
        <select
          value={value || ""}
          onChange={(e) => setValue && setValue(e.target.value)}
        >
          <option value="" disabled={true}>Select {label}</option>
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
