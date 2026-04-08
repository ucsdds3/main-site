import Page from "src/Shared/Page/Page";
import DashboardStatsStrip from "./Components/DashboardStatsStrip";
import DashboardLineChart from "./Components/DashboardLineChart";
import DashboardPieChart from "./Components/DashboardPieChart";

export default function Insights() {
  return (
    <Page>
      <div className="mx-auto w-full max-w-[1800px] px-6 py-8 font-body">
        <div className="flex w-full flex-col gap-4">
          <DashboardStatsStrip />
          <div className="flex flex-wrap flex-1 min-h-[420px] w-full items-stretch gap-0 justify-center">
            <div className="min-w-[max(33%,300px)]  flex flex-col flex-1 min-h-0">
              <DashboardPieChart />
            </div>
            <div className="min-w-[max(67%,300px)] flex flex-col flex-1 min-h-0">
              <DashboardLineChart />
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
