import { twMerge } from "src/Utils/cn";

function slugId(label: string) {
  return (
    label
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .toLowerCase() || "field"
  );
}

interface SelectProps {
  label: string;
  fieldId?: string;
  hideLabel?: boolean;
  /** When false, no “Select {label}” placeholder row (e.g. admin table picker). Default true. */
  showPlaceholderOption?: boolean;
  options: string[];
  error?: boolean;
  icon?: React.ReactNode;
  required?: boolean;
  className?: string;
  value?: string;
  setValue?: (value: string) => void;
  disabled?: boolean;
}

const Select = ({
  label,
  fieldId,
  hideLabel,
  showPlaceholderOption = true,
  error,
  icon,
  className,
  required,
  options,
  value,
  setValue,
  disabled,
}: SelectProps) => {
  const id = fieldId ?? slugId(label);

  return (
    <div className={twMerge(`flex min-w-[300px] w-[300px] flex-col gap-2`, className)}>
      <span
        className={twMerge("text-sm font-medium text-(--obs-text-muted)", hideLabel && "sr-only")}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <label className={twMerge("obs-input-row", error && "obs-input-row-error")} htmlFor={id}>
        {icon}
        <select
          id={id}
          className="obs-select-field"
          value={value || ""}
          disabled={disabled}
          onChange={e => setValue && setValue(e.target.value)}
        >
          {showPlaceholderOption ? (
            <option value="" disabled className="hidden">
              Select {label}
            </option>
          ) : null}
          {options.map(option => (
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
