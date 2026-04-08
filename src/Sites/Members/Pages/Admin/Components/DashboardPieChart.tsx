import { useState, useRef } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { TfiDownload } from "react-icons/tfi";
import { usePieChartData, type PieChartGrouping } from "../Hooks/usePieChartData";
import {
  PIE_COLORS,
  PIE_GROUP_BY_LABELS,
  EVENT_ATTENDANCE_GROUP_BY,
  MEMBERS_GROUP_BY,
  exportPieChartPdf,
} from "../Utils/chartUtils";
import Select from "src/Sites/Members/Components/Select";

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

  const handleCategoryChange = (value: "eventAttendance" | "members") => {
    setCategory(value);
    const nextOptions = value === "members" ? MEMBERS_GROUP_BY : EVENT_ATTENDANCE_GROUP_BY;
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
    <div className="flex h-full min-h-0 w-full flex-1 flex-col justify-center gap-3 font-body">
      <div className="flex w-full shrink-0 flex-wrap items-end gap-3 pl-3">
        <Select
          label="Category"
          fieldId="pie-chart-category"
          showPlaceholderOption={false}
          options={["Attendance", "Members"]}
          value={category === "eventAttendance" ? "Attendance" : "Members"}
          setValue={label => {
            if (label === "Attendance") handleCategoryChange("eventAttendance");
            else if (label === "Members") handleCategoryChange("members");
          }}
          className="min-w-[150px] w-[150px]!"
        />
        <Select
          label="Group by"
          fieldId="pie-chart-groupby"
          showPlaceholderOption={false}
          options={groupByOptions.map(o => o.label)}
          value={PIE_GROUP_BY_LABELS[effectiveGroupBy]}
          setValue={label => {
            const opt = groupByOptions.find(o => o.label === label);
            if (opt) setGroupBy(opt.value);
          }}
          className="min-w-[150px] w-[150px]!"
        />
          <button
            type="button"
            className="btn btn-primary btn-md h-12"
            onClick={handleExportPdf}
            disabled={loading || labels.length === 0}
            title="Export to PDF"
          >
            <TfiDownload className="text-xl" />
          </button>
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
