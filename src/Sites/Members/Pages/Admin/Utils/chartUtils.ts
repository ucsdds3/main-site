import { jsPDF } from "jspdf";
import type { PieChartGrouping } from "../Hooks/usePieChartData";
import type { LineChartGroupBy } from "../Hooks/useLineChartData";

export const PIE_GROUP_BY_LABELS: Record<PieChartGrouping, string> = {
  tag: "Tag",
  venue: "Venue",
  timeOfDay: "Time of Day",
  year: "Year",
  major: "Major",
};

export const PIE_COLORS = [
  { bg: "rgba(255, 99, 132, 0.2)", border: "rgba(255, 99, 132, 1)" },
  { bg: "rgba(54, 162, 235, 0.2)", border: "rgba(54, 162, 235, 1)" },
  { bg: "rgba(255, 206, 86, 0.2)", border: "rgba(255, 206, 86, 1)" },
  { bg: "rgba(75, 192, 192, 0.2)", border: "rgba(75, 192, 192, 1)" },
  { bg: "rgba(153, 102, 255, 0.2)", border: "rgba(153, 102, 255, 1)" },
  { bg: "rgba(255, 159, 64, 0.2)", border: "rgba(255, 159, 64, 1)" },
];

export const EVENT_ATTENDANCE_GROUP_BY: { value: PieChartGrouping; label: string }[] = [
  { value: "tag", label: "Tag" },
  { value: "venue", label: "Venue" },
  { value: "timeOfDay", label: "Time of Day" },
];

export const MEMBERS_GROUP_BY: { value: PieChartGrouping; label: string }[] = [
  { value: "year", label: "Year" },
  { value: "major", label: "Major" },
];

export const LINE_GROUP_BY_LABELS: Record<LineChartGroupBy, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
};

export const LINE_GROUP_BY_OPTIONS: { value: LineChartGroupBy; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
];

export const LINE_CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
    },
  },
};

export interface ExportPieChartPdfParams {
  category: "eventAttendance" | "members";
  groupBy: PieChartGrouping;
  canvas: HTMLCanvasElement | null;
  labels: string[];
  dataValues: number[];
}

export function exportPieChartPdf({
  category,
  groupBy,
  canvas,
  labels,
  dataValues,
}: ExportPieChartPdfParams): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const categoryTitle = category === "members" ? "Members" : "Attendance";
  const groupByTitle = PIE_GROUP_BY_LABELS[groupBy];
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

  let imgH = 0;
  const chartTop = 32;
  if (canvas) {
    const imgData = canvas.toDataURL("image/png");
    const imgW = Math.min(160, pageW - 28);
    imgH = (canvas.height / canvas.width) * imgW;
    doc.addImage(imgData, "PNG", 14, chartTop, imgW, imgH);
  }

  const bottomMargin = 25;
  const rowHeight = 7;

  const tableTop = canvas ? chartTop + imgH + 12 : 40;
  doc.setFontSize(11);
  doc.text("Label", 14, tableTop);
  doc.text("Count", pageW - 20, tableTop);
  doc.setDrawColor(200, 200, 200);
  doc.line(14, tableTop + 2, pageW - 14, tableTop + 2);

  doc.setFontSize(10);
  let y = tableTop + 8;
  labels.forEach((l, i) => {
    if (y + rowHeight > pageH - bottomMargin) {
      doc.addPage();
      y = 20;
      doc.setFontSize(11);
      doc.text("Label", 14, y);
      doc.text("Count", pageW - 20, y);
      doc.setDrawColor(200, 200, 200);
      doc.line(14, y + 2, pageW - 14, y + 2);
      doc.setFontSize(10);
      y += 8;
    }
    const val = dataValues[i];
    const valStr = typeof val === "number" ? String(Math.round(val)) : String(val);
    doc.text(l, 14, y);
    doc.text(valStr, pageW - 20, y, { align: "right" });
    y += rowHeight;
  });

  doc.setDrawColor(220, 220, 220);
  doc.line(14, pageH - 20, pageW - 14, pageH - 20);

  doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
}

export interface ExportLineChartPdfParams {
  groupBy: LineChartGroupBy;
  startDate: string;
  endDate: string;
  canvas: HTMLCanvasElement | null;
  groupedData: { label: string; count: number }[];
}

export function exportLineChartPdf({
  groupBy,
  startDate,
  endDate,
  canvas,
  groupedData,
}: ExportLineChartPdfParams): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const groupByTitle = LINE_GROUP_BY_LABELS[groupBy];
  const title = `Attendance by ${groupByTitle}`;
  const collectedAt = new Date().toLocaleString(undefined, {
    dateStyle: "long",
    timeStyle: "short",
  });

  doc.setFontSize(16);
  doc.text(title, 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Data collected: ${collectedAt}`, 14, 26);
  if (startDate || endDate) {
    doc.text(`Range: ${startDate || "…"} – ${endDate || "…"}`, 14, 32);
  }
  doc.setTextColor(0, 0, 0);

  let imgH = 0;
  const chartTop = startDate || endDate ? 38 : 32;
  if (canvas) {
    const imgData = canvas.toDataURL("image/png");
    const imgW = Math.min(160, pageW - 28);
    imgH = (canvas.height / canvas.width) * imgW;
    doc.addImage(imgData, "PNG", 14, chartTop, imgW, imgH);
  }

  const bottomMargin = 25;
  const rowHeight = 7;

  const tableTop = canvas ? chartTop + imgH + 12 : 44;
  doc.setFontSize(11);
  doc.text("Period", 14, tableTop);
  doc.text("Count", pageW - 20, tableTop);
  doc.setDrawColor(200, 200, 200);
  doc.line(14, tableTop + 2, pageW - 14, tableTop + 2);

  doc.setFontSize(10);
  let y = tableTop + 8;
  groupedData.forEach((d) => {
    if (y + rowHeight > pageH - bottomMargin) {
      doc.addPage();
      y = 20;
      doc.setFontSize(11);
      doc.text("Period", 14, y);
      doc.text("Count", pageW - 20, y);
      doc.setDrawColor(200, 200, 200);
      doc.line(14, y + 2, pageW - 14, y + 2);
      doc.setFontSize(10);
      y += 8;
    }
    doc.text(d.label, 14, y);
    doc.text(String(d.count), pageW - 20, y, { align: "right" });
    y += rowHeight;
  });

  doc.setDrawColor(220, 220, 220);
  doc.line(14, pageH - 20, pageW - 14, pageH - 20);

  doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
}
