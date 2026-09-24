import { toast } from "react-hot-toast";
import { supabase } from "src/Utils/supabase";
import { useState, useEffect, RefObject } from "react";

import { ColumnDefinition, ColumnType } from "../Utils/types";
import {
  eventWorkflowStatusConfirmMessage,
  isEventWorkflowStatus,
  type EventWorkflowStatus,
} from "../Utils/eventWorkflow";
import { normalizeTeamsField } from "../../../Utils/functions";
import { processFormValue, formatColumnLabel, compressImage } from "../../../Utils/functions";
import { labelToTeamKey, teamKeyToLabel } from "src/Sites/Main/Pages/Board/boardTeamConfig";

/** Prefer a short human message when Edge/Resend return JSON blobs. */
function formatConfirmStatusError(raw: string): string {
  const trimmed = raw.trim();
  const resendPrefix = "Resend failed (";
  if (trimmed.startsWith(resendPrefix)) {
    const jsonStart = trimmed.indexOf("{");
    if (jsonStart >= 0) {
      try {
        const parsed = JSON.parse(trimmed.slice(jsonStart)) as { message?: string };
        if (parsed.message) {
          const statusMatch = trimmed.match(/Resend failed \((\d+)\)/);
          const status = statusMatch?.[1];
          return status
            ? `Email failed (${status}): ${parsed.message}`
            : `Email failed: ${parsed.message}`;
        }
      } catch {
        /* fall through */
      }
    }
  }
  return trimmed;
}

async function invokeConfirmEventStatus(
  eventId: unknown,
  workflowStatus: EventWorkflowStatus
): Promise<{ emailed: boolean }> {
  const { data, error } = await supabase.functions.invoke("confirm-event-status", {
    body: {
      event_id: eventId,
      workflow_status: workflowStatus,
    },
  });

  if (error) {
    let detail = error.message;
    const ctx = (error as { context?: Response }).context;
    if (ctx && typeof ctx.json === "function") {
      try {
        const body = await ctx.json();
        if (body && typeof body === "object" && "error" in body) {
          detail = String((body as { error: unknown }).error);
        } else if (body) {
          detail = JSON.stringify(body);
        }
      } catch {
        /* keep detail */
      }
    }
    if (
      detail === error.message &&
      data &&
      typeof data === "object" &&
      "error" in data &&
      (data as { error: unknown }).error
    ) {
      detail = String((data as { error: unknown }).error);
    }
    throw new Error(formatConfirmStatusError(detail));
  }
  if (data && typeof data === "object" && "error" in data && data.error) {
    throw new Error(formatConfirmStatusError(String((data as { error: string }).error)));
  }

  const emailed = Boolean(
    data && typeof data === "object" && "emailed" in data && (data as { emailed: boolean }).emailed
  );
  return { emailed };
}

interface UseEditCardProps<T> {
  tableName: string;
  columns: ColumnDefinition<T>[];
  selectedRow: T | null;
  reloadRef?: RefObject<{ reload: () => void; clearSelection: () => void } | null>;
}

export default function useEditCard<T extends Record<string, unknown>>({
  tableName,
  columns,
  selectedRow,
  reloadRef,
}: UseEditCardProps<T>) {
  const [formData, setFormData] = useState<Partial<T>>({});
  const [loading, setLoading] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  /** Last confirmed/saved workflow status (status changes only via Confirm). */
  const [savedWorkflowStatus, setSavedWorkflowStatus] = useState<EventWorkflowStatus>("none");

  useEffect(() => {
    const loadRowData = async () => {
      if (selectedRow) {
        const rowData = { ...selectedRow };
        const statusRaw = (rowData as Record<string, unknown>).workflow_status;
        const status: EventWorkflowStatus = isEventWorkflowStatus(statusRaw) ? statusRaw : "none";
        (rowData as Record<string, unknown>).workflow_status = status;
        setFormData(rowData);
        setSavedWorkflowStatus(status);
        setIsNew(false);
        setPendingImageFile(null);
        setImagePreviewUrl(null);
      } else {
        const defaults: Partial<T> = {};
        columns.forEach(col => {
          if (col.key === "workflow_status") {
            defaults[col.key] = "none" as unknown as T[keyof T];
            return;
          }
          if (col.optional) defaults[col.key] = null as unknown as T[keyof T];
          else if (col.type === "boolean") defaults[col.key] = false as unknown as T[keyof T];
          else if (col.type === "number") defaults[col.key] = 0 as unknown as T[keyof T];
          else if (col.type === "array") defaults[col.key] = [] as unknown as T[keyof T];
          else if (col.type === "json") defaults[col.key] = {} as unknown as T[keyof T];
          else defaults[col.key] = "" as unknown as T[keyof T];
        });
        if (tableName === "Events" && !("workflow_status" in defaults)) {
          (defaults as Record<string, unknown>).workflow_status = "none";
        }
        setFormData(defaults);
        setSavedWorkflowStatus("none");
        setIsNew(true);
        setPendingImageFile(null);
        setImagePreviewUrl(null);
      }
    };

    loadRowData();
  }, [selectedRow, columns, tableName]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleChange = (key: keyof T, value: unknown, type: ColumnType) => {
    const processedValue = processFormValue(value, type);

    setFormData(prev => ({
      ...prev,
      [key]: processedValue,
    }));
  };

  const handleFileUpload = async (key: keyof T, file: File) => {
    if (!file) return;

    setLoading(true);
    try {
      if (file.size > 250 * 1024) {
        toast.error("File is too large. Please use an image under 250KB.");
        setLoading(false);
        return;
      }

      const compressedFile = await compressImage(file);

      if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }

      const previewUrl = URL.createObjectURL(compressedFile);
      setImagePreviewUrl(previewUrl);
      setPendingImageFile(compressedFile);

      setFormData(prev => ({
        ...prev,
        [key]: previewUrl,
      }));

      toast.success("Image ready for upload");
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to process image");
      console.error("Error processing file:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadImageFile = async (file: File, tags: string[] | null): Promise<string> => {
    if (!tags || tags.length === 0) {
      throw new Error("Tags are required to upload image");
    }

    const bucketName = "Event Images";
    const firstTag = tags[0];
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;
    const filePath = `${firstTag}/${fileName}`;

    const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (uploadError) {
      if (uploadError.message.includes("Bucket") || uploadError.message.includes("bucket")) {
        throw new Error(
          `Storage bucket "${bucketName}" not found. Please create a bucket named "${bucketName}" in your Supabase Storage settings.`
        );
      }
      throw uploadError;
    }

    // Use public URL by default to avoid expiration issues
    // If bucket is private, use signed URL with very long expiration (100 years)
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(filePath);

    // Create signed URL with 100 years expiration (effectively permanent)
    const { data: signedData, error: urlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 100 * 365 * 24 * 60 * 60); // 100 years expiration

    // Prefer public URL if available, otherwise use signed URL
    if (!urlError && signedData) {
      return signedData.signedUrl;
    }

    // Fallback to public URL
    return publicUrl;
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const missingFields: string[] = [];
      columns.forEach(col => {
        if (col.optional === true || col.join) return;

        const value = formData[col.key];

        if (col.key === "description" && tableName === "Events" && col.type === "text") {
          const descValue = String(value || "");
          if (!value || descValue.length < 100) {
            missingFields.push(`${formatColumnLabel(col.key)} (minimum 100 characters)`);
            return;
          }
        }

        if (col.type === "array") {
          if (!value || (Array.isArray(value) && value.length === 0)) {
            missingFields.push(formatColumnLabel(col.key));
          }
          return;
        }

        if (value === null || value === undefined || value === "") {
          missingFields.push(formatColumnLabel(col.key));
        }
      });

      if (missingFields.length > 0) {
        toast.error(`Missing required fields: ${missingFields.join(", ")}`);
        setLoading(false);
        return;
      }

      const pendingWorkflowStatus: EventWorkflowStatus = isEventWorkflowStatus(
        (formData as Record<string, unknown>).workflow_status
      )
        ? ((formData as Record<string, unknown>).workflow_status as EventWorkflowStatus)
        : "none";

      if (
        isNew &&
        tableName === "Events" &&
        pendingWorkflowStatus !== "none" &&
        !confirm(eventWorkflowStatusConfirmMessage(pendingWorkflowStatus))
      ) {
        setLoading(false);
        return;
      }

      const finalFormData = { ...formData };
      if (
        pendingImageFile &&
        finalFormData.tags &&
        Array.isArray(finalFormData.tags) &&
        finalFormData.tags.length > 0
      ) {
        const uploadedUrl = await uploadImageFile(pendingImageFile, finalFormData.tags as string[]);
        (finalFormData as Record<string, unknown>).image = uploadedUrl;

        if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(imagePreviewUrl);
        }
        setPendingImageFile(null);
        setImagePreviewUrl(null);
      }

      const dataToSave = { ...finalFormData };
      // Status changes go through Confirm (emails); never patch via Save/Update.
      const fieldsToExclude = ["id", "created_at", "updated_at", "qr_code", "workflow_status"];
      columns.forEach(col => {
        if (col.join) fieldsToExclude.push(col.key as string);
      });
      fieldsToExclude.forEach(field => delete dataToSave[field as keyof T]);

      if (Object.prototype.hasOwnProperty.call(dataToSave, "teams")) {
        const normalized = normalizeTeamsField((dataToSave as Record<string, unknown>).teams);
        (dataToSave as Record<string, unknown>).teams =
          Object.keys(normalized).length > 0 ? normalized : null;
      }

      if (tableName === "BoardTeams") {
        const label = String((dataToSave as Record<string, unknown>).label ?? "").trim();
        let teamKey = String((dataToSave as Record<string, unknown>).team_key ?? "").trim();
        if (!teamKey && label) {
          teamKey = labelToTeamKey(label);
          (dataToSave as Record<string, unknown>).team_key = teamKey;
        }
        if (!teamKey) {
          toast.error("Team key is required (or provide a label to auto-generate it).");
          setLoading(false);
          return;
        }
        (dataToSave as Record<string, unknown>).team_key = teamKey;
        (dataToSave as Record<string, unknown>).label = label || teamKeyToLabel(teamKey, []);
        if ((dataToSave as Record<string, unknown>).description == null) {
          (dataToSave as Record<string, unknown>).description = "";
        }
        if (
          (dataToSave as Record<string, unknown>).sort_order === "" ||
          (dataToSave as Record<string, unknown>).sort_order == null
        ) {
          (dataToSave as Record<string, unknown>).sort_order = 100;
        }
        (dataToSave as Record<string, unknown>).updated_at = new Date().toISOString();
      }

      columns.forEach(col => {
        if (col.type !== "date") return;
        if (!dataToSave[col.key]) delete (dataToSave as Record<string, unknown>)[col.key as string];
      });

      if (isNew) {
        if (tableName === "Events") {
          (dataToSave as Record<string, unknown>).workflow_status = "none";
        }
        const { data: inserted, error } = await supabase
          .from(tableName)
          .insert([dataToSave])
          .select("id")
          .single();
        if (error) throw error;

        if (tableName === "Events" && pendingWorkflowStatus !== "none" && inserted?.id) {
          const { emailed } = await invokeConfirmEventStatus(inserted.id, pendingWorkflowStatus);
          toast.success(
            emailed ? "Event created; status confirmed and email sent." : "Event created; status confirmed."
          );
        } else {
          toast.success("Row created successfully");
        }
      } else {
        const { error } = await supabase.from(tableName).update(dataToSave).eq("id", formData.id);
        if (error) throw error;
        toast.success("Row updated successfully");
      }

      reloadRef?.current?.reload();
      reloadRef?.current?.clearSelection();
    } catch (error) {
      toast.error((error as Error).message || "Failed to save");
      console.error("Error saving:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExtendEventEnd = async () => {
    if (tableName !== "Events" || !formData.id || isNew) return;

    setLoading(true);
    try {
      const tempEnd = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      const { error } = await supabase
        .from("Events")
        .update({ temp_end: tempEnd })
        .eq("id", formData.id);

      if (error) throw error;

      setFormData(prev => ({ ...prev, temp_end: tempEnd }));
      toast.success("Event window extended by 5 minutes.");
      reloadRef?.current?.reload();
    } catch (err) {
      toast.error((err as Error).message || "Failed to extend event");
      console.error("Error extending event:", err);
    } finally {
      setLoading(false);
    }
  };

  const draftWorkflowStatus: EventWorkflowStatus = isEventWorkflowStatus(
    (formData as Record<string, unknown>).workflow_status
  )
    ? ((formData as Record<string, unknown>).workflow_status as EventWorkflowStatus)
    : "none";

  const workflowStatusDirty = !isNew && draftWorkflowStatus !== savedWorkflowStatus;

  const handleConfirmWorkflowStatus = async () => {
    if (tableName !== "Events" || !formData.id || isNew) return;
    if (!workflowStatusDirty) {
      toast.error("Change the status before confirming.");
      return;
    }

    if (!confirm(eventWorkflowStatusConfirmMessage(draftWorkflowStatus))) return;

    setLoading(true);
    try {
      const { emailed } = await invokeConfirmEventStatus(formData.id, draftWorkflowStatus);

      setSavedWorkflowStatus(draftWorkflowStatus);
      toast.success(emailed ? "Status confirmed and email sent." : "Status confirmed.");
      reloadRef?.current?.reload();
    } catch (err) {
      toast.error((err as Error).message || "Failed to confirm status");
      console.error("Error confirming workflow status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRow || isNew) return;

    if (!confirm("Are you sure you want to delete this row?")) return;

    setLoading(true);
    try {
      const isAttendance = tableName === "Attendance";
      const { error } = isAttendance
        ? await supabase.from(tableName).delete().eq("id", formData.id)
        : await supabase.from(tableName).update({ deleted: true }).eq("id", formData.id);
      if (error) throw error;
      toast.success("Row deleted successfully");

      reloadRef?.current?.reload();
      reloadRef?.current?.clearSelection();
    } catch (error) {
      toast.error((error as Error).message || "Failed to delete");
      console.error("Error deleting:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    isNew,
    handleChange,
    handleFileUpload,
    handleSave,
    handleDelete,
    handleExtendEventEnd,
    handleConfirmWorkflowStatus,
    workflowStatusDirty,
    savedWorkflowStatus,
  };
}
