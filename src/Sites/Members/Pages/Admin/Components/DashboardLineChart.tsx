import { useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { TfiDownload } from "react-icons/tfi";
import { useLineChartData, type LineChartGroupBy } from "../Hooks/useLineChartData";
import {
  LINE_GROUP_BY_OPTIONS,
  LINE_CHART_OPTIONS,
  exportLineChartPdf,
} from "../Utils/chartUtils";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function DashboardLineChart() {
  const chartRef = useRef<ChartJS<"line", number[], string> | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const {
    groupedData,
    groupBy,
    setGroupBy,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    loading,
    error,
  } = useLineChartData();

  const handleExportPdf = () => {
    const canvas = chartRef.current?.canvas ?? chartContainerRef.current?.querySelector("canvas");
    exportLineChartPdf({
      groupBy,
      startDate,
      endDate,
      canvas: canvas instanceof HTMLCanvasElement ? canvas : null,
      groupedData,
    });
  };

  const chartData = {
    labels: groupedData.map(d => d.label),
    datasets: [
      {
        label: "Attendance",
        data: groupedData.map(d => d.count),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return (
    <div className="w-full h-full flex flex-col flex-1 min-h-0 gap-3">
      <div className="flex flex-wrap gap-3 w-full pl-3 shrink-0 items-end">
        <div className="form-control flex flex-col">
          <label htmlFor="line-chart-start" className="label">
            <span className="label-text">Start date</span>
          </label>
          <input
            id="line-chart-start"
            type="date"
            className="input input-bordered text-lg font-semibold py-2 w-[150px]"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>
        <div className="form-control flex flex-col">
          <label htmlFor="line-chart-end" className="label">
            <span className="label-text">End date</span>
          </label>
          <input
            id="line-chart-end"
            type="date"
            className="input input-bordered text-lg font-semibold py-2 w-[150px]"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>
        <div className="form-control flex flex-col">
          <label htmlFor="line-chart-groupby" className="label">
            <span className="label-text">Group by</span>
          </label>
          <select
            id="line-chart-groupby"
            className="select select-bordered text-lg font-semibold py-2 w-[150px]"
            value={groupBy}
            onChange={e => setGroupBy(e.target.value as LineChartGroupBy)}
          >
            {LINE_GROUP_BY_OPTIONS.map(opt => (
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
            disabled={loading || groupedData.length === 0}
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
        <span className="loading loading-dots loading-md shrink-0" />
      ) : (
        <div ref={chartContainerRef} className="w-full flex-1 min-h-0 max-h-[400px]">
          <Line ref={chartRef} data={chartData} options={LINE_CHART_OPTIONS} />
        </div>
      )}
    </div>
  );
}
