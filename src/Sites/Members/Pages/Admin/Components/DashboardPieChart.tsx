import { useState, useRef } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { jsPDF } from "jspdf";
import { TfiDownload } from "react-icons/tfi";
import { usePieChartData, type PieChartGrouping } from "../Hooks/usePieChartData";

ChartJS.register(ArcElement, Tooltip, Legend);

const GROUP_BY_LABELS: Record<PieChartGrouping, string> = {
  tag: "Tag",
  venue: "Venue",
  timeOfDay: "Time of Day",
  year: "Year",
  major: "Major",
};

const PIE_COLORS = [
  { bg: "rgba(255, 99, 132, 0.2)", border: "rgba(255, 99, 132, 1)" },
  { bg: "rgba(54, 162, 235, 0.2)", border: "rgba(54, 162, 235, 1)" },
  { bg: "rgba(255, 206, 86, 0.2)", border: "rgba(255, 206, 86, 1)" },
  { bg: "rgba(75, 192, 192, 0.2)", border: "rgba(75, 192, 192, 1)" },
  { bg: "rgba(153, 102, 255, 0.2)", border: "rgba(153, 102, 255, 1)" },
  { bg: "rgba(255, 159, 64, 0.2)", border: "rgba(255, 159, 64, 1)" },
];

const EVENT_ATTENDANCE_GROUP_BY: { value: PieChartGrouping; label: string }[] = [
  { value: "tag", label: "Tag" },
  { value: "venue", label: "Venue" },
  { value: "timeOfDay", label: "Time of Day" },
];

const MEMBERS_GROUP_BY: { value: PieChartGrouping; label: string }[] = [
  { value: "year", label: "Year" },
  { value: "major", label: "Major" },
];

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

  const handleCategoryChange = (value: string) => {
    const nextCategory = value as "eventAttendance" | "members";
    setCategory(nextCategory);
    const nextOptions = nextCategory === "members" ? MEMBERS_GROUP_BY : EVENT_ATTENDANCE_GROUP_BY;
    setGroupBy(nextOptions[0].value);
  };

  const handleExportPdf = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const categoryTitle = category === "members" ? "Members" : "Attendance";
    const groupByTitle = GROUP_BY_LABELS[effectiveGroupBy];
    const title = `${categoryTitle} by ${groupByTitle}`;
    const collectedAt = new Date().toLocaleString(undefined, {
      dateStyle: "long",
      timeStyle: "short",
    });

    doc.setFontSize(16);
    doc.text(title, 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Data collected: ${collectedAt}`, 14, 26);
    doc.setTextColor(0, 0, 0);

    const canvas = chartRef.current?.canvas ?? chartContainerRef.current?.querySelector("canvas");
    let imgH = 0;
    const chartTop = 32;
    if (canvas instanceof HTMLCanvasElement) {
      const imgData = canvas.toDataURL("image/png");
      const imgW = Math.min(160, pageW - 28);
      imgH = (canvas.height / canvas.width) * imgW;
      doc.addImage(imgData, "PNG", 14, chartTop, imgW, imgH);
    }

    const tableTop = canvas instanceof HTMLCanvasElement ? chartTop + imgH + 12 : 40;
    doc.setFontSize(11);
    doc.text("Label", 14, tableTop);
    doc.text("Count", pageW - 20, tableTop);
    doc.setDrawColor(200, 200, 200);
    doc.line(14, tableTop + 2, pageW - 14, tableTop + 2);

    doc.setFontSize(10);
    labels.forEach((l, i) => {
      const y = tableTop + 8 + i * 7;
      const val = dataValues[i];
      const valStr = typeof val === "number" ? String(Math.round(val)) : String(val);
      doc.text(l, 14, y);
      doc.text(valStr, pageW - 20, y, { align: "right" });
    });

    doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div className="w-1/3 flex flex-col items-center justify-center gap-3">
      <div className="flex flex-wrap gap-3 w-full pl-3">
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
        <div ref={chartContainerRef} className="w-full max-w-md">
          <Pie
            ref={chartRef}
            data={chartData}
            options={{
              plugins: {
                legend: { position: "bottom" },
                tooltip: {
                  callbacks: {
                    label: ctx => {
                      const raw = ctx.raw;
                      const n = typeof raw === "number" ? Math.round(raw) : raw;
                      return `${ctx.label}: ${n}`;
                    },
                  },
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
