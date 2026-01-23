import { useMemo } from "react";
import { PortalMemberType } from "../../../../../Utils/types";
import { NameFilter, TierFilter, StatusFilter, NumericFilter } from "../types";
import { getTier } from "../utils";

interface UseMemberFiltersProps {
  allMembers: PortalMemberType[];
  nameFilter: NameFilter;
  tierFilter: TierFilter;
  statusFilter: StatusFilter;
  pointsFilter: NumericFilter;
  experienceFilter: NumericFilter;
  graduationYearFilter: NumericFilter;
  majorFilter: NameFilter;
}

export function useMemberFilters({
  allMembers,
  nameFilter,
  tierFilter,
  statusFilter,
  pointsFilter,
  experienceFilter,
  graduationYearFilter,
  majorFilter,
}: UseMemberFiltersProps) {
  const filteredMembers = useMemo(() => {
    return allMembers.filter(member => {
      // Name filter
      if (nameFilter.search.trim()) {
        const searchLower = nameFilter.search.toLowerCase();
        const nameLower = member.name.toLowerCase();
        const emailLower = member.email.toLowerCase();
        let matches = false;

        if (nameFilter.mode === "contains") {
          matches = nameLower.includes(searchLower) || emailLower.includes(searchLower);
        } else if (nameFilter.mode === "starts") {
          matches = nameLower.startsWith(searchLower) || emailLower.startsWith(searchLower);
        } else if (nameFilter.mode === "ends") {
          matches = nameLower.endsWith(searchLower) || emailLower.endsWith(searchLower);
        }

        if (!matches) return false;
      }

      // Major filter (if major field exists)
      if (majorFilter.search.trim() && (member as any).major) {
        const searchLower = majorFilter.search.toLowerCase();
        const majorLower = ((member as any).major || "").toLowerCase();
        let matches = false;

        if (majorFilter.mode === "contains") {
          matches = majorLower.includes(searchLower);
        } else if (majorFilter.mode === "starts") {
          matches = majorLower.startsWith(searchLower);
        } else if (majorFilter.mode === "ends") {
          matches = majorLower.endsWith(searchLower);
        }

        if (!matches) return false;
      }

      // Tier filter
      if (tierFilter.selected.length > 0) {
        const memberTier = getTier(member.experience);
        if (!tierFilter.selected.includes(memberTier)) return false;
      }

      // Status filter
      if (statusFilter.selected.length > 0) {
        const isActive = !member.deleted;
        const status = isActive ? "Active" : "Inactive";
        if (!statusFilter.selected.includes(status)) return false;
      }

      // Points filter
      if (pointsFilter.value.trim()) {
        const filterValue = parseFloat(pointsFilter.value);
        if (isNaN(filterValue)) return false;

        if (pointsFilter.mode === "eq" && member.points !== filterValue) return false;
        if (pointsFilter.mode === "lt" && member.points >= filterValue) return false;
        if (pointsFilter.mode === "gt" && member.points <= filterValue) return false;
      }

      // Experience filter
      if (experienceFilter.value.trim()) {
        const filterValue = parseFloat(experienceFilter.value);
        if (isNaN(filterValue)) return false;

        if (experienceFilter.mode === "eq" && member.experience !== filterValue) return false;
        if (experienceFilter.mode === "lt" && member.experience >= filterValue) return false;
        if (experienceFilter.mode === "gt" && member.experience <= filterValue) return false;
      }

      // Graduation Year filter
      if (graduationYearFilter.value.trim() && (member as any).graduation_year) {
        const filterValue = parseFloat(graduationYearFilter.value);
        if (isNaN(filterValue)) return false;
        const year = (member as any).graduation_year;

        if (graduationYearFilter.mode === "eq" && year !== filterValue) return false;
        if (graduationYearFilter.mode === "lt" && year >= filterValue) return false;
        if (graduationYearFilter.mode === "gt" && year <= filterValue) return false;
      }

      return true;
    });
  }, [allMembers, nameFilter, tierFilter, statusFilter, pointsFilter, experienceFilter, graduationYearFilter, majorFilter]);

  return filteredMembers;
}
