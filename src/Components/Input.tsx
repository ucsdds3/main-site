import { twMerge } from "tailwind-merge";

interface InputProps {
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  error?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const Input = ({ label, error, required = true, type, placeholder, icon, className }: InputProps) => {
  return (
    <div className={twMerge(`flex flex-col gap-2 min-w-[300px] w-[300px]`, className)}>
      <span className="text-lg">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <label className={`input input-lg ${error ? "input-error" : "input-primary"}`}>
        {icon}
        <input type={type} required={required} placeholder={placeholder} />
      </label>
    </div>
  );
};

export default Input;
