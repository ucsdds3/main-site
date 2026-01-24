import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import { supabase } from "src/Utils/supabase";

import { ColumnDefinition, ColumnType } from "../Utils/types";
import { processFormValue } from "../Utils/functions";
import { TfiClose } from "react-icons/tfi";

export interface EditCardProps<T = any> {
  tableName: string;
  columns: ColumnDefinition<T>[];
  selectedRow: T | null;
  reloadRef?: React.MutableRefObject<{ reload: () => void; clearSelection: () => void } | null>;
}

export default function EditCard<T extends Record<string, any>>({
  tableName,
  columns,
  selectedRow,
  reloadRef,
}: EditCardProps<T>) {
  const [formData, setFormData] = useState<Partial<T>>({});
  const [loading, setLoading] = useState(false);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    if (selectedRow) {
      setFormData(selectedRow);
      setIsNew(false);
    } else {
      // Initialize with default values for new row
      const defaults: Partial<T> = {};
      columns.forEach(col => {
        switch (col.type) {
          case "boolean":
            defaults[col.key] = false as any;
            break;
          case "number":
            defaults[col.key] = 0 as any;
            break;
          case "array":
            defaults[col.key] = [] as any;
            break;
          default:
            defaults[col.key] = "" as any;
        }
      });
      setFormData(defaults);
      setIsNew(true);
    }
  }, [selectedRow, columns]);

  const handleChange = (key: keyof T, value: any, type: ColumnType) => {
    const processedValue = processFormValue(value, type);

    setFormData(prev => ({
      ...prev,
      [key]: processedValue,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Validate required fields
      const missingFields = columns
        .filter(col => col.required && !formData[col.key])
        .map(col => col.label);

      if (missingFields.length > 0) {
        toast.error(`Missing required fields: ${missingFields.join(", ")}`);
        setLoading(false);
        return;
      }

      // Exclude auto-generated fields
      const fieldsToExclude = ["id", "created_at", "updated_at"];
      const dataToSave = { ...formData };
      fieldsToExclude.forEach(field => {
        delete dataToSave[field as keyof T];
      });

      if (isNew) {
        const { error } = await supabase.from(tableName).insert([dataToSave]);
        if (error) throw error;
        toast.success("Row created successfully");
      } else {
        const { error } = await supabase.from(tableName).update(dataToSave).eq("id", formData.id);
        if (error) throw error;
        toast.success("Row updated successfully");
      }

      // Reload table and clear selection
      reloadRef?.current?.reload();
      reloadRef?.current?.clearSelection();
    } catch (error: any) {
      toast.error(error.message || "Failed to save");
      console.error("Error saving:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRow || isNew) return;

    if (!confirm("Are you sure you want to delete this row?")) return;

    setLoading(true);
    try {
      const { error } = await supabase.from(tableName).delete().eq("id", formData.id);
      if (error) throw error;
      toast.success("Row deleted successfully");

      // Reload table and clear selection
      reloadRef?.current?.reload();
      reloadRef?.current?.clearSelection();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
      console.error("Error deleting:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (col: ColumnDefinition<T>) => {
    const value = formData[col.key];

    switch (col.type) {
      case "boolean":
        return (
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={Boolean(value)}
            onChange={e => handleChange(col.key, e.target.checked, col.type)}
          />
        );
      case "number":
        return (
          <input
            type="number"
            className="input input-bordered w-full"
            value={(value as number) || 0}
            onChange={e => handleChange(col.key, e.target.value, col.type)}
          />
        );
      case "date":
        return (
          <input
            type="datetime-local"
            className="input input-bordered w-full"
            value={value ? new Date(value as string).toISOString().slice(0, 16) : ""}
            onChange={e => handleChange(col.key, e.target.value, col.type)}
          />
        );
      case "array":
      case "json":
        return (
          <textarea
            className="textarea textarea-bordered w-full"
            rows={3}
            value={JSON.stringify(value || [], null, 2)}
            onChange={e => handleChange(col.key, e.target.value, col.type)}
            placeholder='["item1", "item2"]'
          />
        );
      default:
        return (
          <input
            type="text"
            className="input input-bordered w-full"
            value={String(value || "")}
            onChange={e => handleChange(col.key, e.target.value, col.type)}
          />
        );
    }
  };

  return (
    <div className="rounded-2xl bg-base-300 p-6">
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="font-semibold text-3xl">{isNew ? "Add New Row" : "Edit Row"}</h3>
        {selectedRow && (
          <button
            className="btn btn-sm btn-ghost text-xl font-bold"
            onClick={() => reloadRef?.current?.clearSelection()}
          >
            <TfiClose />
          </button>
        )}
      </div>

      <div className="flex flex-col max-h-[70vh] gap-4">
        <div className="space-y-4 overflow-y-auto rounded-lg border border-base-content/20 p-4">
          {columns
            .filter(col => col.key !== "id" && col.key !== "created_at" && col.key !== "updated_at")
            .map(col => (
              <div key={String(col.key)} className="form-control">
                <label className="label">
                  <span className="label-text">
                    {col.label}
                    {col.required && <span className="text-error ml-1">*</span>}
                  </span>
                </label>
                {renderInput(col)}
              </div>
            ))}
        </div>

        <div className="flex gap-2">
          <button className="btn btn-primary flex-1 btn-lg" onClick={handleSave} disabled={loading}>
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : isNew ? (
              "Create"
            ) : (
              "Save"
            )}
          </button>
          {!isNew && (
            <button className="btn btn-error btn-lg" onClick={handleDelete} disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-sm" /> : "Delete"}
            </button>
          )}
          <button
            className="btn btn-outline btn-lg"
            onClick={() => reloadRef?.current?.clearSelection()}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
