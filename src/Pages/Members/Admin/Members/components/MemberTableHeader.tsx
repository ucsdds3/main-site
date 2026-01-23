import { RefObject } from "react";
import FilterHeader from "./FilterHeader";
import { SortColumn, SortDirection, FilterColumn, NameFilter, TierFilter, StatusFilter, NumericFilter } from "../types";
import { tiers } from "../utils";

interface MemberTableHeaderProps {
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  openDropdown: FilterColumn;
  dropdownRefs: {
    name: RefObject<HTMLDivElement | null>;
    tier: RefObject<HTMLDivElement | null>;
    status: RefObject<HTMLDivElement | null>;
    points: RefObject<HTMLDivElement | null>;
    experience: RefObject<HTMLDivElement | null>;
    major: RefObject<HTMLDivElement | null>;
    graduation_year: RefObject<HTMLDivElement | null>;
  };
  nameFilter: NameFilter;
  tierFilter: TierFilter;
  statusFilter: StatusFilter;
  pointsFilter: NumericFilter;
  experienceFilter: NumericFilter;
  graduationYearFilter: NumericFilter;
  majorFilter: NameFilter;
  onHeaderClick: (column: FilterColumn) => void;
  onSortClick: (column: SortColumn) => void;
  onNameFilterChange: (filter: NameFilter) => void;
  onTierFilterChange: (filter: TierFilter) => void;
  onStatusFilterChange: (filter: StatusFilter) => void;
  onPointsFilterChange: (filter: NumericFilter) => void;
  onExperienceFilterChange: (filter: NumericFilter) => void;
  onGraduationYearFilterChange: (filter: NumericFilter) => void;
  onMajorFilterChange: (filter: NameFilter) => void;
}

export default function MemberTableHeader({
  sortColumn,
  sortDirection,
  openDropdown,
  dropdownRefs,
  nameFilter,
  tierFilter,
  statusFilter,
  pointsFilter,
  experienceFilter,
  graduationYearFilter,
  majorFilter,
  onHeaderClick,
  onSortClick,
  onNameFilterChange,
  onTierFilterChange,
  onStatusFilterChange,
  onPointsFilterChange,
  onExperienceFilterChange,
  onGraduationYearFilterChange,
  onMajorFilterChange,
}: MemberTableHeaderProps) {
  return (
    <thead className="bg-base-100 text-white/60 sticky top-0 z-10">
      <tr>
        {/* Member Column */}
        <FilterHeader
          label="Member"
          column="name"
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          isOpen={openDropdown === "name"}
          dropdownRef={dropdownRefs.name}
          onHeaderClick={() => onHeaderClick("name")}
        >
          <ul className="dropdown-content menu bg-base-100 border border-white/10 rounded-lg p-4 shadow-lg z-20 min-w-[280px] mt-1">
            <li className="mb-3">
              <div className="text-lg font-semibold">Sort</div>
            </li>
            <li>
              <button
                className="w-full text-left hover:bg-white/10 p-2 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  onSortClick("name");
                }}
              >
                <span className={sortColumn === "name" ? "text-primary" : ""}>
                  {sortColumn === "name" && sortDirection === "asc" ? "↑ " : ""}
                  {sortColumn === "name" && sortDirection === "desc" ? "↓ " : ""}
                  Sort by Name {sortColumn === "name" ? `(${sortDirection === "asc" ? "A-Z" : "Z-A"})` : ""}
                </span>
              </button>
            </li>
            <li className="mb-3 mt-3 border-t border-white/10 pt-3">
              <div className="text-lg font-semibold">Filter by Name/Email</div>
            </li>
            <li>
              <div className="flex justify-between gap-2 mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="nameMode"
                    checked={nameFilter.mode === "contains"}
                    onChange={() => onNameFilterChange({ ...nameFilter, mode: "contains" })}
                    className="radio radio-primary radio-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm">Contains</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="nameMode"
                    checked={nameFilter.mode === "starts"}
                    onChange={() => onNameFilterChange({ ...nameFilter, mode: "starts" })}
                    className="radio radio-primary radio-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm">Starts</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="nameMode"
                    checked={nameFilter.mode === "ends"}
                    onChange={() => onNameFilterChange({ ...nameFilter, mode: "ends" })}
                    className="radio radio-primary radio-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm">Ends</span>
                </label>
              </div>
            </li>
            <li>
              <input
                type="text"
                placeholder="Search name or email..."
                value={nameFilter.search}
                onChange={(e) => onNameFilterChange({ ...nameFilter, search: e.target.value })}
                className="input input-primary input-sm w-full"
                onClick={(e) => e.stopPropagation()}
              />
            </li>
          </ul>
        </FilterHeader>

        {/* Tier Column */}
        <FilterHeader
          label="Tier"
          column="tier"
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          isOpen={openDropdown === "tier"}
          dropdownRef={dropdownRefs.tier}
          onHeaderClick={() => onHeaderClick("tier")}
        >
          <ul className="dropdown-content menu bg-base-100 border border-white/10 rounded-lg p-4 shadow-lg z-20 min-w-[200px] mt-1">
            <li className="mb-3">
              <div className="text-lg font-semibold">Sort</div>
            </li>
            <li>
              <button
                className="w-full text-left hover:bg-white/10 p-2 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  onSortClick("tier");
                }}
              >
                <span className={sortColumn === "tier" ? "text-primary" : ""}>
                  {sortColumn === "tier" && sortDirection === "asc" ? "↑ " : ""}
                  {sortColumn === "tier" && sortDirection === "desc" ? "↓ " : ""}
                  Sort by Tier {sortColumn === "tier" ? `(${sortDirection === "asc" ? "A-Z" : "Z-A"})` : ""}
                </span>
              </button>
            </li>
            <li className="mb-3 mt-3 border-t border-white/10 pt-3">
              <div className="text-lg font-semibold">Filter by Tier</div>
            </li>
            {tiers.map(tier => (
              <li key={tier}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tierFilter.selected.includes(tier)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onTierFilterChange({ selected: [...tierFilter.selected, tier] });
                      } else {
                        onTierFilterChange({ selected: tierFilter.selected.filter(t => t !== tier) });
                      }
                    }}
                    className="checkbox checkbox-primary checkbox-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm">{tier}</span>
                </label>
              </li>
            ))}
          </ul>
        </FilterHeader>

        {/* Status Column */}
        <FilterHeader
          label="Status"
          column="status"
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          isOpen={openDropdown === "status"}
          dropdownRef={dropdownRefs.status}
          onHeaderClick={() => onHeaderClick("status")}
        >
          <ul className="dropdown-content menu bg-base-100 border border-white/10 rounded-lg p-4 shadow-lg z-20 min-w-[200px] mt-1">
            <li className="mb-3">
              <div className="text-lg font-semibold">Sort</div>
            </li>
            <li>
              <button
                className="w-full text-left hover:bg-white/10 p-2 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  onSortClick("status");
                }}
              >
                <span className={sortColumn === "status" ? "text-primary" : ""}>
                  {sortColumn === "status" && sortDirection === "asc" ? "↑ " : ""}
                  {sortColumn === "status" && sortDirection === "desc" ? "↓ " : ""}
                  Sort by Status {sortColumn === "status" ? `(${sortDirection === "asc" ? "Active first" : "Inactive first"})` : ""}
                </span>
              </button>
            </li>
            <li className="mb-3 mt-3 border-t border-white/10 pt-3">
              <div className="text-lg font-semibold">Filter by Status</div>
            </li>
            {["Active", "Inactive"].map(status => (
              <li key={status}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={statusFilter.selected.includes(status)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onStatusFilterChange({ selected: [...statusFilter.selected, status] });
                      } else {
                        onStatusFilterChange({ selected: statusFilter.selected.filter(s => s !== status) });
                      }
                    }}
                    className="checkbox checkbox-primary checkbox-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm">{status}</span>
                </label>
              </li>
            ))}
          </ul>
        </FilterHeader>

        {/* Points Column */}
        <FilterHeader
          label="Points"
          column="points"
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          isOpen={openDropdown === "points"}
          dropdownRef={dropdownRefs.points}
          onHeaderClick={() => onHeaderClick("points")}
        >
          <ul className="dropdown-content menu bg-base-100 border border-white/10 rounded-lg p-4 shadow-lg z-20 min-w-[240px] mt-1">
            <li className="mb-3">
              <div className="text-lg font-semibold">Sort</div>
            </li>
            <li>
              <button
                className="w-full text-left hover:bg-white/10 p-2 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  onSortClick("points");
                }}
              >
                <span className={sortColumn === "points" ? "text-primary" : ""}>
                  {sortColumn === "points" && sortDirection === "asc" ? "↑ " : ""}
                  {sortColumn === "points" && sortDirection === "desc" ? "↓ " : ""}
                  Sort by Points {sortColumn === "points" ? `(${sortDirection === "asc" ? "Low to High" : "High to Low"})` : ""}
                </span>
              </button>
            </li>
            <li className="mb-3 mt-3 border-t border-white/10 pt-3">
              <div className="text-lg font-semibold">Filter by Points</div>
            </li>
            <li>
              <div className="flex justify-around gap-2 mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pointsMode"
                    checked={pointsFilter.mode === "eq"}
                    onChange={() => onPointsFilterChange({ ...pointsFilter, mode: "eq" })}
                    className="radio radio-primary radio-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-lg">=</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pointsMode"
                    checked={pointsFilter.mode === "lt"}
                    onChange={() => onPointsFilterChange({ ...pointsFilter, mode: "lt" })}
                    className="radio radio-primary radio-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-lg">&lt;</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pointsMode"
                    checked={pointsFilter.mode === "gt"}
                    onChange={() => onPointsFilterChange({ ...pointsFilter, mode: "gt" })}
                    className="radio radio-primary radio-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-lg">&gt;</span>
                </label>
              </div>
            </li>
            <li>
              <input
                type="number"
                placeholder="Enter number..."
                value={pointsFilter.value}
                onChange={(e) => onPointsFilterChange({ ...pointsFilter, value: e.target.value })}
                className="input input-primary input-sm w-full"
                onClick={(e) => e.stopPropagation()}
              />
            </li>
          </ul>
        </FilterHeader>

        {/* Experience Column */}
        <FilterHeader
          label="XP"
          column="experience"
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          isOpen={openDropdown === "experience"}
          dropdownRef={dropdownRefs.experience}
          onHeaderClick={() => onHeaderClick("experience")}
        >
          <ul className="dropdown-content menu bg-base-100 border border-white/10 rounded-lg p-4 shadow-lg z-20 min-w-[240px] mt-1">
            <li className="mb-3">
              <div className="text-lg font-semibold">Sort</div>
            </li>
            <li>
              <button
                className="w-full text-left hover:bg-white/10 p-2 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  onSortClick("experience");
                }}
              >
                <span className={sortColumn === "experience" ? "text-primary" : ""}>
                  {sortColumn === "experience" && sortDirection === "asc" ? "↑ " : ""}
                  {sortColumn === "experience" && sortDirection === "desc" ? "↓ " : ""}
                  Sort by Experience {sortColumn === "experience" ? `(${sortDirection === "asc" ? "Low to High" : "High to Low"})` : ""}
                </span>
              </button>
            </li>
            <li className="mb-3 mt-3 border-t border-white/10 pt-3">
              <div className="text-lg font-semibold">Filter by Experience</div>
            </li>
            <li>
              <div className="flex justify-around gap-2 mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="experienceMode"
                    checked={experienceFilter.mode === "eq"}
                    onChange={() => onExperienceFilterChange({ ...experienceFilter, mode: "eq" })}
                    className="radio radio-primary radio-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm">=</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="experienceMode"
                    checked={experienceFilter.mode === "lt"}
                    onChange={() => onExperienceFilterChange({ ...experienceFilter, mode: "lt" })}
                    className="radio radio-primary radio-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm">&lt;</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="experienceMode"
                    checked={experienceFilter.mode === "gt"}
                    onChange={() => onExperienceFilterChange({ ...experienceFilter, mode: "gt" })}
                    className="radio radio-primary radio-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm">&gt;</span>
                </label>
              </div>
            </li>
            <li>
              <input
                type="number"
                placeholder="Enter number..."
                value={experienceFilter.value}
                onChange={(e) => onExperienceFilterChange({ ...experienceFilter, value: e.target.value })}
                className="input input-primary input-sm w-full"
                onClick={(e) => e.stopPropagation()}
              />
            </li>
          </ul>
        </FilterHeader>

        {/* Major Column */}
        <FilterHeader
          label="Major"
          column="major"
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          isOpen={openDropdown === "major"}
          dropdownRef={dropdownRefs.major}
          dropdownEnd
          onHeaderClick={() => onHeaderClick("major")}
        >
          <ul className="dropdown-content menu bg-base-100 border border-white/10 rounded-lg p-4 shadow-lg z-20 min-w-[280px] mt-1">
            <li className="mb-3">
              <div className="text-lg font-semibold">Filter by Major</div>
            </li>
            <li>
              <div className="flex justify-between gap-2 mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="majorMode"
                    checked={majorFilter.mode === "contains"}
                    onChange={() => onMajorFilterChange({ ...majorFilter, mode: "contains" })}
                    className="radio radio-primary radio-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm">Contains</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="majorMode"
                    checked={majorFilter.mode === "starts"}
                    onChange={() => onMajorFilterChange({ ...majorFilter, mode: "starts" })}
                    className="radio radio-primary radio-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm">Starts</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="majorMode"
                    checked={majorFilter.mode === "ends"}
                    onChange={() => onMajorFilterChange({ ...majorFilter, mode: "ends" })}
                    className="radio radio-primary radio-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm">Ends</span>
                </label>
              </div>
            </li>
            <li>
              <input
                type="text"
                placeholder="Search major..."
                value={majorFilter.search}
                onChange={(e) => onMajorFilterChange({ ...majorFilter, search: e.target.value })}
                className="input input-primary input-sm w-full"
                onClick={(e) => e.stopPropagation()}
              />
            </li>
          </ul>
        </FilterHeader>

        {/* Graduation Year Column */}
        <FilterHeader
          label="Grad Year"
          column="graduation_year"
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          isOpen={openDropdown === "graduation_year"}
          dropdownRef={dropdownRefs.graduation_year}
          dropdownEnd
          onHeaderClick={() => onHeaderClick("graduation_year")}
        >
          <ul className="dropdown-content menu bg-base-100 border border-white/10 rounded-lg p-4 shadow-lg z-20 min-w-[240px] mt-1">
            <li className="mb-3">
              <div className="text-lg font-semibold">Filter by Graduation Year</div>
            </li>
            <li>
              <div className="flex justify-around gap-2 mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="graduationYearMode"
                    checked={graduationYearFilter.mode === "eq"}
                    onChange={() => onGraduationYearFilterChange({ ...graduationYearFilter, mode: "eq" })}
                    className="radio radio-primary radio-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-lg">=</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="graduationYearMode"
                    checked={graduationYearFilter.mode === "lt"}
                    onChange={() => onGraduationYearFilterChange({ ...graduationYearFilter, mode: "lt" })}
                    className="radio radio-primary radio-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-lg">&lt;</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="graduationYearMode"
                    checked={graduationYearFilter.mode === "gt"}
                    onChange={() => onGraduationYearFilterChange({ ...graduationYearFilter, mode: "gt" })}
                    className="radio radio-primary radio-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-lg">&gt;</span>
                </label>
              </div>
            </li>
            <li>
              <input
                type="number"
                placeholder="Enter year..."
                value={graduationYearFilter.value}
                onChange={(e) => onGraduationYearFilterChange({ ...graduationYearFilter, value: e.target.value })}
                className="input input-primary input-sm w-full"
                onClick={(e) => e.stopPropagation()}
              />
            </li>
          </ul>
        </FilterHeader>
      </tr>
    </thead>
  );
}
