import {
  EMPTY_GRADUATION_YEAR_FILTER,
  type GraduationYearFilter as GraduationYearFilterState,
} from "../types";
import { toggleGraduationUnknown, toggleGraduationYear } from "../utils";
import { FieldLabel } from "./ui";

interface GraduationYearFilterProps {
  value: GraduationYearFilterState;
  yearOptions: number[];
  onChange: (value: GraduationYearFilterState) => void;
}

const GraduationYearFilter = ({ value, yearOptions, onChange }: GraduationYearFilterProps) => {
  const isActive = value.years.length > 0 || value.includeUnknown;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <FieldLabel>Graduation year</FieldLabel>
        {isActive ? (
          <button
            type="button"
            className="text-xs font-semibold text-[#F58134] hover:underline"
            onClick={() => onChange(EMPTY_GRADUATION_YEAR_FILTER)}
          >
            All
          </button>
        ) : (
          <span className="text-xs text-(--obs-text-faint)">All (default)</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={`rounded-md border px-3 py-2 text-sm transition ${
            value.includeUnknown
              ? "border-[#19B5CA]/55 bg-[#19B5CA]/15 text-[#8eeaf4]"
              : "border-(--obs-border) bg-transparent text-(--obs-text-muted) hover:border-[#19B5CA]/45 hover:text-(--obs-text-primary)"
          }`}
          onClick={() => onChange(toggleGraduationUnknown(value))}
        >
          Unknown
        </button>
        {yearOptions.map(year => {
          const isSelected = value.years.includes(year);
          return (
            <button
              key={year}
              type="button"
              className={`rounded-md border px-3 py-2 text-sm transition ${
                isSelected
                  ? "border-[#19B5CA]/55 bg-[#19B5CA]/15 text-[#8eeaf4]"
                  : "border-(--obs-border) bg-transparent text-(--obs-text-muted) hover:border-[#19B5CA]/45 hover:text-(--obs-text-primary)"
              }`}
              onClick={() => onChange(toggleGraduationYear(value, year))}
            >
              {year}
            </button>
          );
        })}
      </div>

      <p className="text-xs leading-5 text-(--obs-text-faint)">
        Select one or more class years and/or Unknown. Matches use graduation_year from search
        results (OR logic).
      </p>
    </div>
  );
};

export default GraduationYearFilter;
