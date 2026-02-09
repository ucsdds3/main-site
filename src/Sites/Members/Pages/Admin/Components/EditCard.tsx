import { RefObject } from "react";
import { TfiClose } from "react-icons/tfi";

import { ColumnDefinition } from "../Utils/types";
import useEditCard from "../Hooks/useEditCard";
import { formatColumnLabel, convertUTCToPST, convertPSTToUTC } from "../../../Utils/functions";

export interface EditCardProps<T> {
  tableName: string;
  columns: ColumnDefinition<T>[];
  selectedRow: T | null;
  reloadRef?: RefObject<{ reload: () => void; clearSelection: () => void } | null>;
  canEdit?: boolean;
  canAdd?: boolean;
}

export default function EditCard<T extends Record<string, unknown>>({
  tableName,
  columns,
  selectedRow,
  reloadRef,
  canEdit = false,
  canAdd = false,
}: EditCardProps<T>) {
  const { formData, loading, isNew, handleChange, handleFileUpload, handleSave, handleDelete } =
    useEditCard({
      tableName,
      columns,
      selectedRow,
      reloadRef,
    });

  const canModify = isNew ? canAdd : canEdit;

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
            key={String(selectedRow?.id || "new")}
            type="file"
            accept="image/*"
            className="file-input file-input-bordered w-full"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) {
                handleFileUpload(col.key, file);
              }
            }}
            disabled={loading || !canModify}
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
            disabled={!canModify}
          />
        );
      case "number":
        return (
          <input
            type="number"
            className="input input-bordered w-full"
            value={(value as number) || 0}
            onChange={e => handleChange(col.key, e.target.value, col.type)}
            disabled={!canModify}
          />
        );
      case "date": {
        return (
          <input
            type="datetime-local"
            className="input input-bordered w-full"
            value={value ? convertUTCToPST(value as string) : ""}
            onChange={e => {
              // Convert PST from input to UTC for storage
              const utcValue = e.target.value ? convertPSTToUTC(e.target.value) : "";
              handleChange(col.key, utcValue, col.type);
            }}
            disabled={!canModify}
          />
        );
      }
      case "array":
        if (col.key === "tags") {
          const tagOptions = ["Workshop", "Professional", "Social", "Fundraiser", "Other"];
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
                    disabled={!canModify}
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
            disabled={!canModify}
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
            disabled={!canModify}
          />
        );
      default:
        if (col.key === "admin_level" && col.type === "text") {
          const adminLevelOptions = ["Member", "Board", "Executive"];
          return (
            <select
              className="select select-bordered w-full"
              value={String(value || "")}
              onChange={e => handleChange(col.key, e.target.value || null, col.type)}
              disabled={!canModify}
            >
              {adminLevelOptions.map(level => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          );
        }
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
                disabled={!canModify}
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
            disabled={!canModify}
          />
        );
    }
  };

  return (
    <div
      className={`rounded-2xl bg-base-300 p-6 border border-base-content/50 ${canModify || "opacity-50"}`}
    >
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
        <div className="space-y-4 overflow-y-auto rounded-lg border border-base-content/30 p-4">
          {columns
            .filter(col => col.key !== "id" && col.key !== "created_at" && col.key !== "updated_at")
            .map(col => (
              <div key={String(col.key)} className="form-control flex flex-col gap-2">
                <label className="label">
                  <span className="label-text">
                    {formatColumnLabel(col.key)}
                    {col.optional !== true && <span className="text-error ml-1">*</span>}
                  </span>
                </label>
                {renderInput(col)}
              </div>
            ))}
        </div>

        <div className="flex gap-2">
          <>
            <button
              className="btn btn-primary flex-1 btn-lg"
              onClick={handleSave}
              disabled={loading || !canModify}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : isNew ? (
                "Create"
              ) : (
                "Save"
              )}
            </button>
            {!isNew && (
              <button
                className="btn btn-error btn-lg"
                onClick={handleDelete}
                disabled={loading || !canModify}
              >
                {loading ? <span className="loading loading-spinner loading-sm" /> : "Delete"}
              </button>
            )}
          </>
          <button
            className="btn btn-outline btn-lg"
            onClick={() => reloadRef?.current?.clearSelection()}
            disabled={loading}
          >
            {canModify ? "Cancel" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
