import { RefObject } from "react";
import { IoIosArrowUp } from "react-icons/io";
import { SortColumn, SortDirection, FilterColumn } from "../types";

interface FilterHeaderProps {
  label: string;
  column: FilterColumn;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  isOpen: boolean;
  dropdownRef: RefObject<HTMLDivElement | null>;
  onHeaderClick: () => void;
  dropdownEnd?: boolean;
  children: React.ReactNode;
}

export default function FilterHeader({
  label,
  column,
  sortColumn,
  sortDirection,
  isOpen,
  dropdownRef,
  onHeaderClick,
  dropdownEnd = false,
  children,
}: FilterHeaderProps) {
  return (
    <th className="px-4 py-3 bg-base-100">
      <div
        ref={dropdownRef}
        className={`dropdown ${dropdownEnd ? "dropdown-end" : ""} ${isOpen ? "dropdown-open" : ""}`}
      >
        <div
          tabIndex={0}
          role="button"
          className="flex items-center gap-2 cursor-pointer hover:bg-white/10 select-none -mx-2 px-2 py-1 rounded"
          onClick={onHeaderClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onHeaderClick();
            }
          }}
        >
          <span>{label}</span>
          <IoIosArrowUp
            className={`duration-300 transition-transform ${
              sortColumn === column
                ? `text-primary ${sortDirection === "desc" ? "rotate-180" : ""}`
                : "text-white/40"
            }`}
          />
        </div>
        {children}
      </div>
    </th>
  );
}
