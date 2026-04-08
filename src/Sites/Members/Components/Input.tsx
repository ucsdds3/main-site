import { twMerge } from "src/Utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Stable id for input + label association (use when `label` text is not unique). */
  fieldId?: string;
  hideLabel?: boolean;
  /** Rendered after the input inside the obs row (e.g. submit icon button). */
  endAdornment?: React.ReactNode;
  /** Extra classes on the obs-input-row wrapper. */
  inputRowClassName?: string;
  type?: string;
  textarea?: boolean;
  error?: boolean;
  icon?: React.ReactNode;
  className?: string;
  value?: string;
  setValue?: (value: string) => void;
}
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  fieldId?: string;
  hideLabel?: boolean;
  error?: boolean;
  icon?: React.ReactNode;
  className?: string;
  value?: string;
  setValue?: (value: string) => void;
}

function slugId(label: string) {
  return (
    label
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .toLowerCase() || "field"
  );
}

export const Input = ({
  label,
  fieldId,
  hideLabel,
  endAdornment,
  inputRowClassName,
  error,
  icon,
  className,
  value,
  setValue,
  ...props
}: InputProps) => {
  const id = fieldId ?? slugId(label);

  return (
    <div className={twMerge(`flex min-w-[300px] w-[300px] flex-col gap-2`, className)}>
      <span
        className={twMerge("text-sm font-medium text-(--obs-text-muted)", hideLabel && "sr-only")}
      >
        {label} {props.required && <span className="text-red-500">*</span>}
      </span>
      <label
        className={twMerge("obs-input-row", error && "obs-input-row-error", inputRowClassName)}
        htmlFor={id}
      >
        {icon}
        <input
          id={id}
          value={value}
          onChange={e => setValue && setValue(e.target.value)}
          {...props}
        />
        {endAdornment}
      </label>
    </div>
  );
};

export const TextArea = ({
  label,
  fieldId,
  hideLabel,
  error,
  icon,
  className,
  value,
  setValue,
  ...props
}: TextareaProps) => {
  const id = fieldId ?? slugId(label);

  return (
    <div className={twMerge("flex w-full flex-col gap-2", className)}>
      <span
        className={twMerge("text-sm font-medium text-(--obs-text-muted)", hideLabel && "sr-only")}
      >
        {label} {props.required && <span className="text-red-500">*</span>}
      </span>

      <div className={twMerge("obs-textarea-shell", error && "obs-textarea-shell-error")}>
        {icon}
        <textarea id={id} {...props} value={value} onChange={e => setValue?.(e.target.value)} />
      </div>
    </div>
  );
};
