import Page from "src/Shared/Page/Page";
import DashboardStatsStrip from "./Components/DashboardStatsStrip";

export default function Insights() {
  return (
    <Page data-theme="dark">
      <div className="mx-auto max-w-[1800px] px-6 py-8 w-full">
        <DashboardStatsStrip />
      </div>
    </Page>
  );
}
