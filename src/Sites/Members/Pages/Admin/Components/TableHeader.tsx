import { ColumnDefinition } from "../Utils/types";
import { formatColumnLabel } from "../../../Utils/functions";

interface TableHeaderProps<T = any> {
  columns: ColumnDefinition<T>[];
}

export default function TableHeader<T extends Record<string, any>>({
  columns,
}: TableHeaderProps<T>) {
  return (
    <thead>
      <tr>
        {columns
          .filter(col => !col.hide)
          .map(col => (
            <th key={String(col.key)} className="relative max-w-[200px] border-b border-(--obs-border)">
              <span className="font-body fl-text-base/lg text-(--obs-text-primary)">
                {col.label ?? formatColumnLabel(col.key)}
              </span>
            </th>
          ))}
      </tr>
    </thead>
  );
}
