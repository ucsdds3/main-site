import { useEffect, useState, useRef } from "react";
import { Card } from "../Admin";
import DashboardSectionHeader from "../DashboardSectionHeader";
import { PortalMemberType } from "../../../../Utils/types";
import { supabase } from "../../../../Utils/supabase";
import { useTriggerFetchAdmin } from "../../../../Hooks/Members/Admin/useTriggerFetchAdmin";
import { useMemberFilters } from "./hooks/useMemberFilters";
import { useMemberSorting } from "./hooks/useMemberSorting";
import { SortColumn, SortDirection, FilterColumn, NameFilter, TierFilter, StatusFilter, NumericFilter } from "./types";
import MemberTableHeader from "./components/MemberTableHeader";
import MemberTableRow from "./components/MemberTableRow";
import MemberDetailsPanel from "./components/MemberDetailsPanel";

const defaultSelection: PortalMemberType = {
  id: 0,
  name: "John Doe",
  points: 0,
  experience: 0,
  deleted: false,
  created_at: "",
  updated_at: "",
  email: "JohnDoe@Hotmail.com",
  admin_level: 0,
};

export default function MemberLookup() {
  // Filter states
  const [nameFilter, setNameFilter] = useState<NameFilter>({ search: "", mode: "contains" });
  const [tierFilter, setTierFilter] = useState<TierFilter>({ selected: [] });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>({ selected: [] });
  const [pointsFilter, setPointsFilter] = useState<NumericFilter>({ mode: "eq", value: "" });
  const [experienceFilter, setExperienceFilter] = useState<NumericFilter>({ mode: "eq", value: "" });
  const [graduationYearFilter, setGraduationYearFilter] = useState<NumericFilter>({ mode: "eq", value: "" });
  const [majorFilter, setMajorFilter] = useState<NameFilter>({ search: "", mode: "contains" });

  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState<FilterColumn>(null);
  const dropdownRefs = {
    name: useRef<HTMLDivElement>(null),
    tier: useRef<HTMLDivElement>(null),
    status: useRef<HTMLDivElement>(null),
    points: useRef<HTMLDivElement>(null),
    experience: useRef<HTMLDivElement>(null),
    major: useRef<HTMLDivElement>(null),
    graduation_year: useRef<HTMLDivElement>(null),
  };

  const [allMembers, setAllMembers] = useState<PortalMemberType[]>([]);
  const [selected, setSelected] = useState<PortalMemberType>(defaultSelection);
  const [sortColumn, setSortColumn] = useState<SortColumn>("points");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const { triggerFetchAdmin } = useTriggerFetchAdmin();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown === null) return;
      
      const currentRef = dropdownRefs[openDropdown];
      if (currentRef.current && !currentRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await supabase
        .from("Members")
        .select("id,name:full_name,points,experience,deleted,created_at,updated_at,email,admin_level,major,graduation_year")
        .order("points", { ascending: false });
      if (data) {
        setAllMembers(data);
      }
    };
    fetchMembers();
  }, [triggerFetchAdmin]);

  const filteredMembers = useMemberFilters({
    allMembers,
    nameFilter,
    tierFilter,
    statusFilter,
    pointsFilter,
    experienceFilter,
    graduationYearFilter,
    majorFilter,
  });

  const sortedMembers = useMemberSorting({
    filteredMembers,
    sortColumn,
    sortDirection,
  });

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleHeaderClick = (column: FilterColumn) => {
    setOpenDropdown(openDropdown === column ? null : column);
  };

  // Set first member as selected by default or when current selection is not in filtered list
  useEffect(() => {
    if (sortedMembers.length > 0) {
      const isSelectedInFiltered = sortedMembers.some(m => m.id === selected.id);
      if (selected.id === 0 || !isSelectedInFiltered) {
        setSelected(sortedMembers[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedMembers]);

  const handleUpdate = (updated: PortalMemberType) => {
    setSelected(updated);
  };

  return (
    <>
      <section className="lg:col-span-7">
        <Card>
          <DashboardSectionHeader
            title={`Member Lookup: ${sortedMembers.length} result${sortedMembers.length !== 1 ? 's' : ''} found`}
            subtitle="Click column headers to filter. Click arrows to sort."
          />

          <div className="mt-5 overflow-y-auto overflow-x-hidden rounded-2xl border border-white/10 max-h-[520px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <table className="w-full text-left text-sm">
              <MemberTableHeader
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                openDropdown={openDropdown}
                dropdownRefs={dropdownRefs}
                nameFilter={nameFilter}
                tierFilter={tierFilter}
                statusFilter={statusFilter}
                pointsFilter={pointsFilter}
                experienceFilter={experienceFilter}
                graduationYearFilter={graduationYearFilter}
                majorFilter={majorFilter}
                onHeaderClick={handleHeaderClick}
                onSortClick={handleSort}
                onNameFilterChange={setNameFilter}
                onTierFilterChange={setTierFilter}
                onStatusFilterChange={setStatusFilter}
                onPointsFilterChange={setPointsFilter}
                onExperienceFilterChange={setExperienceFilter}
                onGraduationYearFilterChange={setGraduationYearFilter}
                onMajorFilterChange={setMajorFilter}
              />
              <tbody className="divide-y divide-white/10">
                {sortedMembers.map((member, i) => (
                  <MemberTableRow key={i} member={member} onSelect={setSelected} />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <MemberDetailsPanel selected={selected} onUpdate={handleUpdate} />
    </>
  );
}
