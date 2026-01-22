import { useMemo } from "react";
import { PortalMemberType } from "../../../../Utils/types";
import { SortColumn, SortDirection } from "../types";
import { getTier } from "../utils";

interface UseMemberSortingProps {
  filteredMembers: PortalMemberType[];
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}

export function useMemberSorting({
  filteredMembers,
  sortColumn,
  sortDirection,
}: UseMemberSortingProps) {
  const sortedMembers = useMemo(() => {
    if (!sortColumn) return filteredMembers;

    const sorted = [...filteredMembers].sort((a, b) => {
      let comparison = 0;

      switch (sortColumn) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "tier":
          const tierA = getTier(a.experience);
          const tierB = getTier(b.experience);
          comparison = tierA.localeCompare(tierB);
          break;
        case "status":
          comparison = Number(a.deleted) - Number(b.deleted);
          break;
        case "points":
          comparison = a.points - b.points;
          break;
        case "experience":
          comparison = a.experience - b.experience;
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [filteredMembers, sortColumn, sortDirection]);

  return sortedMembers;
}
