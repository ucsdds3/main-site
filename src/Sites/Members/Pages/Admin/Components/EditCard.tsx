import { RefObject } from "react";
import { TfiClose } from "react-icons/tfi";

import { ColumnDefinition } from "../Utils/types";
import useEditCard from "../Hooks/useEditCard";

export interface EditCardProps<T = any> {
  tableName: string;
  columns: ColumnDefinition<T>[];
  selectedRow: T | null;
  reloadRef?: RefObject<{ reload: () => void; clearSelection: () => void } | null>;
}

export default function EditCard<T extends Record<string, any>>({
  tableName,
  columns,
  selectedRow,
  reloadRef,
}: EditCardProps<T>) {
  const {
    formData,
    loading,
    isNew,
    handleChange,
    handleFileUpload,
    handleSave,
    handleDelete,
  } = useEditCard({
    tableName,
    columns,
    selectedRow,
    reloadRef,
  });

  const renderInput = (col: ColumnDefinition<T>) => {
    const value = formData[col.key];

    if (col.key === "image" && col.type === "text") {
      const isBlobUrl = value && String(value).startsWith("blob:");
      return (
        <div className="space-y-2">
          {value && (
            <div>
              <img
                src={String(value)}
                alt="Preview"
                className="w-full aspect-[16/9] object-cover rounded-lg border border-base-content/20"
                onError={e => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
                onLoad={e => {
                  (e.target as HTMLImageElement).style.display = "block";
                }}
              />
              {isBlobUrl ? (
                <p className="text-sm text-success mt-1">File ready for upload</p>
              ) : (
                <p className="text-sm text-gray-400 mt-1 truncate">{String(value)}</p>
              )}
            </div>
          )}
          <input
            key={selectedRow?.id || "new"}
            type="file"
            accept="image/*"
            className="file-input file-input-bordered w-full"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) {
                handleFileUpload(col.key, file);
              }
            }}
            disabled={loading}
          />
        </div>
      );
    }

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
        if (col.key === "tags") {
          const tagOptions = ["Workshop", "Professional", "Social", "Other"];
          const selectedTags = Array.isArray(value) ? value : [];
          
          const handleTagToggle = (tag: string) => {
            const newTags = (selectedTags as string[]).includes(tag)
              ? (selectedTags as string[]).filter((t: string) => t !== tag)
              : [...selectedTags, tag];
            handleChange(col.key, newTags, col.type);
          };

          return (
            <div className="space-y-2">
              {tagOptions.map(tag => (
                <label key={tag} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={(selectedTags as string[]).includes(tag)}
                    onChange={() => handleTagToggle(tag)}
                  />
                  <span>{tag}</span>
                </label>
              ))}
            </div>
          );
        }
        return (
          <textarea
            className="textarea textarea-bordered w-full"
            rows={3}
            value={JSON.stringify(value || [], null, 2)}
            onChange={e => handleChange(col.key, e.target.value, col.type)}
            placeholder='["item1", "item2"]'
          />
        );
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
        if (col.key === "description" && col.type === "text") {
          const descValue = String(value || "");
          const charCount = descValue.length;
          const minChars = 100;
          const isValid = charCount >= minChars;
          
          return (
            <div>
              <textarea
                className={`textarea textarea-bordered w-full ${!isValid && descValue ? "textarea-error" : ""}`}
                rows={4}
                value={descValue}
                onChange={e => handleChange(col.key, e.target.value, col.type)}
                placeholder="Enter description (minimum 100 characters)"
              />
              <div className="label">
                <span className={`label-text-alt ${isValid ? "text-success" : "text-error"}`}>
                  {charCount} / {minChars} characters {isValid ? "✓" : ""}
                </span>
              </div>
            </div>
          );
        }
        
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
                    {col.optional !== true && <span className="text-error ml-1">*</span>}
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
