import { useState, useRef } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { TfiDownload } from "react-icons/tfi";
import { usePieChartData, type PieChartGrouping } from "../Hooks/usePieChartData";
import {
  PIE_COLORS,
  EVENT_ATTENDANCE_GROUP_BY,
  MEMBERS_GROUP_BY,
  exportPieChartPdf,
} from "../Utils/chartUtils";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DashboardPieChart() {
  const chartRef = useRef<ChartJS<"pie", number[], string> | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState<"eventAttendance" | "members">("eventAttendance");
  const [groupBy, setGroupBy] = useState<PieChartGrouping>("tag");
  const { label, data: pieChartData, loading, error } = usePieChartData();

  const groupByOptions = category === "members" ? MEMBERS_GROUP_BY : EVENT_ATTENDANCE_GROUP_BY;
  const effectiveGroupBy = groupByOptions.some(o => o.value === groupBy)
    ? groupBy
    : groupByOptions[0].value;

  const labels = label[effectiveGroupBy];
  const dataValues = pieChartData[effectiveGroupBy];

  const handleCategoryChange = (value: string) => {
    const nextCategory = value as "eventAttendance" | "members";
    setCategory(nextCategory);
    const nextOptions = nextCategory === "members" ? MEMBERS_GROUP_BY : EVENT_ATTENDANCE_GROUP_BY;
    setGroupBy(nextOptions[0].value);
  };

  const handleExportPdf = () => {
    const canvas = chartRef.current?.canvas ?? chartContainerRef.current?.querySelector("canvas");
    exportPieChartPdf({
      category,
      groupBy: effectiveGroupBy,
      canvas: canvas instanceof HTMLCanvasElement ? canvas : null,
      labels,
      dataValues,
    });
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: category === "members" ? "Members" : "Attendance",
        data: dataValues,
        backgroundColor: labels.map((_, i) => PIE_COLORS[i % PIE_COLORS.length].bg),
        borderColor: labels.map((_, i) => PIE_COLORS[i % PIE_COLORS.length].border),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          filter: function (legendItem: { index?: number }) {
            return legendItem?.index ? legendItem.index < 5 : true;
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: { raw: unknown; label: string }) => {
            const raw = ctx.raw;
            const n = typeof raw === "number" ? Math.round(raw) : raw;
            return `${ctx.label}: ${n}`;
          },
        },
      },
    },
  };
  return (
    <div className="w-full h-full flex flex-col flex-1 min-h-0 gap-3 justify-center">
      <div className="flex flex-wrap gap-3 w-full pl-3 shrink-0 items-end">
        <div className="form-control flex flex-col">
          <label htmlFor="pie-chart-category" className="label">
            <span className="label-text">Category</span>
          </label>
          <select
            id="pie-chart-category"
            className="select select-bordered text-lg font-semibold py-2 w-[150px]"
            value={category}
            onChange={e => handleCategoryChange(e.target.value)}
          >
            <option value="eventAttendance">Attendance</option>
            <option value="members">Members</option>
          </select>
        </div>
        <div className="form-control flex flex-col">
          <label htmlFor="pie-chart-groupby" className="label">
            <span className="label-text">Group by</span>
          </label>
          <select
            id="pie-chart-groupby"
            className="select select-bordered text-lg font-semibold py-2 w-[150px]"
            value={effectiveGroupBy}
            onChange={e => setGroupBy(e.target.value as PieChartGrouping)}
          >
            {groupByOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-control flex justify-end">
          <button
            type="button"
            className="btn btn-primary btn-md mt-6"
            onClick={handleExportPdf}
            disabled={loading || labels.length === 0}
            title="Export to PDF"
          >
            <TfiDownload className="text-xl" />
          </button>
        </div>
      </div>
      {error && (
        <div className="text-error text-sm" title={error}>
          {error}
        </div>
      )}
      {loading ? (
        <span className="loading loading-dots loading-md" />
      ) : (
        <div ref={chartContainerRef} className="w-full h-full max-h-[400px]">
          <Pie ref={chartRef} data={chartData} options={options} />
        </div>
      )}
    </div>
  );
}
