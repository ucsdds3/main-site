import { twMerge } from "src/Utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  type?: string;
  textarea?: boolean;
  error?: boolean;
  icon?: React.ReactNode;
  className?: string;
  value?: string;
  setValue?: (value: string) => void;
}
interface TextareaProps extends React.InputHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  type?: string;
  textarea?: boolean;
  error?: boolean;
  icon?: React.ReactNode;
  className?: string;
  value?: string;
  setValue?: (value: string) => void;
}

export const Input = ({ label, error, icon, className, value, setValue, ...props }: InputProps) => {
  return (
    <div className={twMerge(`flex flex-col gap-2 min-w-[300px] w-[300px]`, className)}>
      <span className="text-lg">
        {label} {props.required && <span className="text-red-500">*</span>}
      </span>
      <label className={`input w-full input-lg ${error ? "input-error" : "input-primary"}`}>
        {icon}
        <input
          id={label}
          value={value}
          onChange={e => setValue && setValue(e.target.value)}
          {...props}
        />
      </label>
    </div>
  );
};

export const TextArea = ({
  label,
  error,
  icon,
  className,
  value,
  setValue,
  ...props
}: TextareaProps) => {
  return (
    <div className={twMerge("flex flex-col gap-2 w-full", className)}>
      <span className="text-lg">
        {label} {props.required && <span className="text-red-500">*</span>}
      </span>

      <div
        className={twMerge(
          "flex items-start gap-2 rounded-lg border p-3 bg-base-100",
          error ? "border-error" : "border-primary"
        )}
      >
        {icon}
        <textarea
          id={label}
          {...props}
          value={value}
          onChange={e => setValue?.(e.target.value)}
          className="w-full resize-y min-h-[80px] outline-none bg-transparent"
        />
      </div>
    </div>
  );
};
