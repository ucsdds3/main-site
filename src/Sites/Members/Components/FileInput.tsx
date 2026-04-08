import { twMerge } from "src/Utils/cn";

function slugId(label: string) {
  return label.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase() || "field";
}

interface FileInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "className"> {
  label: string;
  fieldId?: string;
  hideLabel?: boolean;
  className?: string;
}

/** Image / file picker styled like other members obs fields. */
export function FileInput({
  label,
  fieldId,
  hideLabel,
  className,
  accept,
  disabled,
  onChange,
  ...rest
}: FileInputProps) {
  const id = fieldId ?? slugId(label);

  return (
    <div className={twMerge("flex w-full flex-col gap-2", className)}>
      <span
        className={twMerge(
          "text-sm font-medium text-(--obs-text-muted)",
          hideLabel && "sr-only"
        )}
      >
        {label}
      </span>
      <label
        htmlFor={id}
        className="obs-input-row min-h-11 cursor-pointer py-2"
      >
        <input
          id={id}
          type="file"
          accept={accept}
          disabled={disabled}
          onChange={onChange}
          className="min-w-0 flex-1 cursor-pointer text-sm text-(--obs-text-primary) file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-[rgba(25,181,202,0.12)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#19B5CA] hover:file:bg-[rgba(25,181,202,0.2)]"
          {...rest}
        />
      </label>
    </div>
  );
}
