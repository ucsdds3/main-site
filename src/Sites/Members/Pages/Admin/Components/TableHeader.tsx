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
            <th
              key={String(col.key)}
              className="relative min-w-[7.5rem] max-w-[200px] whitespace-normal border-b border-(--obs-border) align-bottom"
            >
              <span className="block font-body fl-text-sm/base leading-snug break-words text-(--obs-text-primary)">
                {col.label ?? formatColumnLabel(col.key)}
              </span>
            </th>
          ))}
      </tr>
    </thead>
  );
}
