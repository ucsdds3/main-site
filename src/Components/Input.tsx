import { twMerge } from "tailwind-merge";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: boolean;
  icon?: React.ReactNode;
  className?: string;
  value?: string;
  setValue?: (value: string) => void;
}

const Input = ({ label, error, icon, className, value, setValue, ...props }: InputProps) => {
  return (
    <div className={twMerge(`flex flex-col gap-2 min-w-[300px] w-[300px]`, className)}>
      <span className="text-lg">
        {label} {props.required && <span className="text-red-500">*</span>}
      </span>
      <label className={`input w-full input-lg ${error ? "input-error" : "input-primary"}`}>
        {icon}
        <input value={value} onChange={(e) => setValue && setValue(e.target.value)} {...props} />
      </label>
    </div>
  );
};

export default Input;
