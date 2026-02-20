import { toast } from "react-hot-toast";
import { supabase } from "src/Utils/supabase";
import { useState, useEffect, RefObject } from "react";

import { ColumnDefinition, ColumnType } from "../Utils/types";
import { processFormValue, formatColumnLabel, compressImage } from "../../../Utils/functions";

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

  useEffect(() => {
    const loadRowData = async () => {
      if (selectedRow) {
        const rowData = { ...selectedRow };
        setFormData(rowData);
        setIsNew(false);
        setPendingImageFile(null);
        setImagePreviewUrl(null);
      } else {
        const defaults: Partial<T> = {};
        columns.forEach(col => {
          switch (col.type) {
            case "boolean":
              defaults[col.key] = false as unknown as T[keyof T];
              break;
            case "number":
              defaults[col.key] = 0 as unknown as T[keyof T];
              break;
            case "array":
              defaults[col.key] = [] as unknown as T[keyof T];
              break;
            default:
              defaults[col.key] = "" as unknown as T[keyof T];
          }
        });
        setFormData(defaults);
        setIsNew(true);
        setPendingImageFile(null);
        setImagePreviewUrl(null);
      }
    };

    loadRowData();
  }, [selectedRow, columns]);

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

        if (col.key === "description" && col.type === "text") {
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

      const fieldsToExclude = ["id", "created_at", "updated_at", "qr_code"];
      columns.forEach(col => {
        if (col.join) fieldsToExclude.push(col.key as string);
      });
      const dataToSave = { ...finalFormData };
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

      reloadRef?.current?.reload();
      reloadRef?.current?.clearSelection();
    } catch (error) {
      toast.error((error as Error).message || "Failed to save");
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
  };
}
