/** One committee in the BoardTeams catalog (DB or JSON fallback). */
export type BoardTeamCatalogEntry = {
  team_key: string;
  label: string;
  description: string;
  sort_order: number;
};
