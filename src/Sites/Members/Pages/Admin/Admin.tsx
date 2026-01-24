import { useState, useRef } from "react";

import Page from "src/Shared/Page/Page";

import EditCard from "./Components/EditCard";
import DataTable from "./Components/DataTable";
import DashboardStatsStrip from "./Components/DashboardStatsStrip";
import { ColumnDefinition, EventRow } from "./Utils/types";

const eventColumns: ColumnDefinition<EventRow>[] = [
  { key: "image", label: "Image", type: "text", editable: true, hide: true },
  { key: "name", label: "Name", type: "text", editable: true },
  { key: "description", label: "Description", type: "text", editable: true },
  { key: "points", label: "Points", type: "number", editable: true },
  { key: "password", label: "Password", type: "text", editable: true },
  { key: "start", label: "Start", type: "date", editable: true },
  { key: "end", label: "End", type: "date", editable: true },
  { key: "location", label: "Location", type: "text", editable: true, optional: true },
  { key: "tags", label: "Tags", type: "array", editable: true },
];

export default function AdminDashboardOnePage() {
  const [selectedEvent, setSelectedEvent] = useState<EventRow | null>(null);
  const reloadRef = useRef<{ reload: () => void; clearSelection: () => void } | null>(null);

  return (
    <Page data-theme="dark">
      <div className="mx-auto max-w-[1800px] px-6 py-8">
        <DashboardStatsStrip />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          <DataTable<EventRow>
            tableName="Events"
            columns={eventColumns}
            onRowSelect={setSelectedEvent}
            reloadRef={reloadRef}
          />

          <EditCard<EventRow>
            tableName="Events"
            columns={eventColumns}
            selectedRow={selectedEvent}
            reloadRef={reloadRef}
          />
        </div>
      </div>
    </Page>
  );
}
