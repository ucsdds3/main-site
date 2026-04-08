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
import { useLineChartData } from "../Hooks/useLineChartData";
import {
  LINE_GROUP_BY_LABELS,
  LINE_GROUP_BY_OPTIONS,
  LINE_CHART_OPTIONS,
  exportLineChartPdf,
} from "../Utils/chartUtils";
import { Input } from "src/Sites/Members/Components/Input";
import Select from "src/Sites/Members/Components/Select";

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
    <div className="flex h-full min-h-0 w-full flex-1 flex-col gap-3 font-body">
      <div className="flex w-full shrink-0 flex-wrap items-end gap-3 pl-3">
        <Input
          label="Start date"
          fieldId="line-chart-start"
          type="date"
          value={startDate}
          setValue={setStartDate}
          className="min-w-0 w-[150px]"
          inputRowClassName="min-h-11 font-normal fl-text-sm/lg"
        />
        <Input
          label="End date"
          fieldId="line-chart-end"
          type="date"
          value={endDate}
          setValue={setEndDate}
          className="min-w-0 w-[150px]"
          inputRowClassName="min-h-11 font-normal fl-text-sm/lg"
        />
        <Select
          label="Group by"
          fieldId="line-chart-groupby"
          showPlaceholderOption={false}
          options={LINE_GROUP_BY_OPTIONS.map(o => o.label)}
          value={LINE_GROUP_BY_LABELS[groupBy]}
          setValue={label => {
            const opt = LINE_GROUP_BY_OPTIONS.find(o => o.label === label);
            if (opt) setGroupBy(opt.value);
          }}
          className="min-w-[150px] w-[150px]!"
        />
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
