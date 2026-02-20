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
            <th key={String(col.key)} className="relative max-w-[200px]">
              <span className="text-lg text-base-content">
                {col.label ?? formatColumnLabel(col.key)}
              </span>
            </th>
          ))}
      </tr>
    </thead>
  );
}
