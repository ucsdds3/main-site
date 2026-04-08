import { RefObject } from "react";
import toast from "react-hot-toast";
import { TfiClose } from "react-icons/tfi";

import { labelToTeamKey, teamKeyToLabel } from "src/Sites/Main/Pages/Board/boardTeamConfig";
import { COMMITTEE_TYPES } from "src/Utils/types";

import { ColumnDefinition } from "../Utils/types";
import useEditCard from "../Hooks/useEditCard";
import {
  formatColumnLabel,
  formatCellValue,
  convertUTCToPST,
  convertPSTToUTC,
} from "../../../Utils/functions";
import { FileInput } from "src/Sites/Members/Components/FileInput";
import { Input, TextArea } from "src/Sites/Members/Components/Input";
import Select from "src/Sites/Members/Components/Select";

import EventQRCode from "./EventQRCode";

const COMMITTEE_STORAGE_KEYS = new Set(COMMITTEE_TYPES.map(l => labelToTeamKey(l)));

function readTeamsFormRecord(raw: unknown): Record<string, string> {
  if (raw === null || raw === undefined) return {};
  if (typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    out[k] = typeof v === "string" ? v : "";
  }
  return out;
}

function sortTeamEntries(entries: [string, string][]): [string, string][] {
  const order = new Map(COMMITTEE_TYPES.map((label, i) => [labelToTeamKey(label), i]));
  return [...entries].sort((a, b) => {
    const ia = order.has(a[0]) ? order.get(a[0])! : 1000;
    const ib = order.has(b[0]) ? order.get(b[0])! : 1000;
    if (ia !== ib) return ia - ib;
    return a[0].localeCompare(b[0]);
  });
}

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
  const {
    formData,
    loading,
    isNew,
    handleChange,
    handleFileUpload,
    handleSave,
    handleDelete,
    handleExtendEventEnd,
  } = useEditCard({
    tableName,
    columns,
    selectedRow,
    reloadRef,
  });

  const canModify = isNew ? canAdd : canEdit;

  const getColumnLabel = (col: ColumnDefinition<T>) => col.label ?? formatColumnLabel(col.key);

  const renderInput = (col: ColumnDefinition<T>) => {
    const value = formData[col.key];

    if (col.join) {
      return (
        <span className="input input-bordered w-full bg-base-200 cursor-not-allowed">
          {formatCellValue(value, col.type)}
        </span>
      );
    }

    if (col.key === "qr_code" && col.type === "qr_code") {
      const password = String(formData.password ?? "");
      return (
        <div className="flex flex-col items-center justify-center gap-2">
          <EventQRCode password={password} eventName={String(formData.name ?? "")} />
          <span className="text-xs text-(--obs-text-muted)">Click to download</span>
        </div>
      );
    }

    if (col.key === "image" && col.type === "text") {
      const isBlobUrl = value && String(value).startsWith("blob:");
      return (
        <div className="space-y-2">
          {value && (
            <div>
              <img
                src={String(value)}
                alt="Preview"
                className="aspect-video w-full rounded-lg border border-(--obs-border) object-cover"
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
          <FileInput
            key={String(selectedRow?.id || "new")}
            label="Upload image"
            fieldId={`ec-image-${String(col.key)}`}
            hideLabel
            accept="image/*"
            disabled={loading || !canModify}
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) {
                handleFileUpload(col.key, file);
              }
            }}
            className="w-full min-w-0"
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
          <Input
            label={getColumnLabel(col)}
            fieldId={`ec-${String(col.key)}`}
            hideLabel
            type="number"
            value={
              value === null || value === undefined || value === "" ? "0" : String(value as number)
            }
            setValue={v => handleChange(col.key, v, col.type)}
            disabled={!canModify}
            className="w-full min-w-0"
          />
        );
      case "date": {
        if (col.key === "temp_end" && tableName === "Events") {
          const tempEnd = value as string | null | undefined;

          return (
            <Input
              label={getColumnLabel(col)}
              fieldId={`ec-${String(col.key)}`}
              hideLabel
              type="datetime-local"
              value={tempEnd ? convertUTCToPST(tempEnd) : ""}
              setValue={v => {
                const utcValue = v ? convertPSTToUTC(v) : "";
                handleChange(col.key, utcValue, col.type);
              }}
              placeholder="Not extended"
              disabled={!canModify}
              className="w-full min-w-0 flex-1"
              inputRowClassName="flex-1"
              endAdornment={
                !isNew && formData.id ? (
                  <button
                    type="button"
                    className="btn btn-primary shrink-0"
                    onClick={() => handleExtendEventEnd()}
                    disabled={loading}
                  >
                    {loading ? <span className="loading loading-spinner" /> : "+5 Mins"}
                  </button>
                ) : undefined
              }
            />
          );
        }
        return (
          <Input
            label={getColumnLabel(col)}
            fieldId={`ec-${String(col.key)}`}
            hideLabel
            type="datetime-local"
            value={value ? convertUTCToPST(value as string) : ""}
            setValue={v => {
              const utcValue = v ? convertPSTToUTC(v) : "";
              handleChange(col.key, utcValue, col.type);
            }}
            disabled={!canModify}
            className="w-full min-w-0"
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
          <TextArea
            label={getColumnLabel(col)}
            fieldId={`ec-${String(col.key)}`}
            hideLabel
            rows={3}
            value={JSON.stringify(value || [], null, 2)}
            setValue={v => handleChange(col.key, v, col.type)}
            placeholder='["item1", "item2"]'
            disabled={!canModify}
            className="w-full min-w-0"
          />
        );
      case "json":
        if (col.key === "teams") {
          const record = readTeamsFormRecord(value);
          const usedKeys = new Set(Object.keys(record));
          const entries = sortTeamEntries(Object.entries(record));
          const firstFreeLabel = COMMITTEE_TYPES.find(l => !usedKeys.has(labelToTeamKey(l)));
          const canAddMore = firstFreeLabel !== undefined;

          const commit = (next: Record<string, string>) => {
            handleChange(col.key, next, col.type);
          };

          return (
            <div className="space-y-2">
              {entries.length === 0 ? (
                <p className="text-sm text-(--obs-text-muted)">No board teams assigned.</p>
              ) : null}
              {entries.map(([storageKey, role]) => {
                const isKnown = COMMITTEE_STORAGE_KEYS.has(storageKey);
                const labelsForRow = COMMITTEE_TYPES.filter(l => {
                  const k = labelToTeamKey(l);
                  return k === storageKey || !usedKeys.has(k);
                });
                return (
                  <div key={storageKey} className="flex gap-2 items-center">
                    <label
                      className="obs-input-row min-w-32 flex-1"
                      htmlFor={`ec-team-pick-${storageKey}`}
                    >
                      <select
                        id={`ec-team-pick-${storageKey}`}
                        className="obs-select-field"
                        value={storageKey}
                        onChange={e => {
                          const newKey = e.target.value;
                          if (newKey === storageKey) return;
                          if (record[newKey] !== undefined) {
                            toast.error("That team is already listed");
                            return;
                          }
                          const next = { ...record };
                          delete next[storageKey];
                          next[newKey] = role;
                          commit(next);
                        }}
                        disabled={!canModify}
                      >
                        {!isKnown ? (
                          <option value={storageKey}>{teamKeyToLabel(storageKey)}</option>
                        ) : null}
                        {labelsForRow.map(lbl => {
                          const k = labelToTeamKey(lbl);
                          return (
                            <option key={k} value={k}>
                              {lbl}
                            </option>
                          );
                        })}
                      </select>
                    </label>
                    <Input
                      label="Role / title"
                      fieldId={`ec-team-role-${storageKey}`}
                      hideLabel
                      type="text"
                      value={role}
                      placeholder="Role / title"
                      setValue={v => commit({ ...record, [storageKey]: v })}
                      disabled={!canModify}
                      className="min-w-32 flex-1"
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-square shrink-0"
                      aria-label="Remove team"
                      onClick={() => {
                        const next = { ...record };
                        delete next[storageKey];
                        commit(next);
                      }}
                      disabled={!canModify}
                    >
                      <TfiClose />
                    </button>
                  </div>
                );
              })}
              <button
                type="button"
                className="btn btn-outline btn-sm w-full"
                disabled={!canModify || !canAddMore}
                onClick={() => {
                  if (!firstFreeLabel) {
                    toast.error("All teams are already listed");
                    return;
                  }
                  const k = labelToTeamKey(firstFreeLabel);
                  commit({ ...record, [k]: "" });
                }}
              >
                Add Team
              </button>
            </div>
          );
        }
        return (
          <TextArea
            label={getColumnLabel(col)}
            fieldId={`ec-${String(col.key)}`}
            hideLabel
            rows={3}
            value={JSON.stringify(value || [], null, 2)}
            setValue={v => handleChange(col.key, v, col.type)}
            placeholder='["item1", "item2"]'
            disabled={!canModify}
            className="w-full min-w-0"
          />
        );
      default:
        if (col.key === "admin_level" && col.type === "text") {
          const adminLevelOptions = ["Member", "Board", "Executive"];
          return (
            <Select
              label={getColumnLabel(col)}
              fieldId={`ec-${String(col.key)}`}
              hideLabel
              showPlaceholderOption={false}
              options={adminLevelOptions}
              value={String(value || "")}
              setValue={v => handleChange(col.key, v || null, col.type)}
              disabled={!canModify}
              className="w-full min-w-0"
            />
          );
        }
        if (col.key === "description" && col.type === "text") {
          const descValue = String(value || "");
          const charCount = descValue.length;
          const minChars = 100;
          const isValid = charCount >= minChars;

          return (
            <div>
              <TextArea
                label={getColumnLabel(col)}
                fieldId={`ec-${String(col.key)}`}
                hideLabel
                rows={4}
                value={descValue}
                setValue={v => handleChange(col.key, v, col.type)}
                placeholder="Enter description (minimum 100 characters)"
                disabled={!canModify}
                error={!isValid && !!descValue}
                className="w-full min-w-0"
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
          <Input
            label={getColumnLabel(col)}
            fieldId={`ec-${String(col.key)}`}
            hideLabel
            type="text"
            value={String(value ?? "")}
            setValue={v => handleChange(col.key, v, col.type)}
            disabled={!canModify}
            className="w-full min-w-0"
          />
        );
    }
  };

  return (
    <div className={`obs-panel p-6 font-body ${canModify || "opacity-50"}`}>
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="text-fluid-subsection-title">{isNew ? "Add New Row" : "Edit Row"}</h3>
        {selectedRow && (
          <button
            className="btn btn-sm btn-ghost font-body text-xl font-semibold"
            onClick={() => reloadRef?.current?.clearSelection()}
          >
            <TfiClose />
          </button>
        )}
      </div>

      <div className="flex flex-col max-h-[70vh] gap-4">
        <div className="space-y-4 overflow-y-auto rounded-lg border border-(--obs-border) p-4">
          {columns
            .filter(col => col.key !== "id" && col.key !== "created_at" && col.key !== "updated_at")
            .map(col => (
              <div key={String(col.key)} className="form-control flex flex-col gap-2">
                <label className="label">
                  <span className="label-text font-body text-sm font-medium text-(--obs-text-muted)">
                    {getColumnLabel(col)}
                    {col.optional !== true && <span className="ml-1 text-error">*</span>}
                  </span>
                </label>
                {renderInput(col)}
              </div>
            ))}
        </div>

        <div className="flex gap-2">
          <>
            <button
              className="btn btn-primary btn-lg flex-1 font-body"
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
                className="btn btn-error btn-lg font-body"
                onClick={handleDelete}
                disabled={loading || !canModify}
              >
                {loading ? <span className="loading loading-spinner loading-sm" /> : "Delete"}
              </button>
            )}
          </>
          <button
            className="btn btn-outline btn-lg font-body"
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
