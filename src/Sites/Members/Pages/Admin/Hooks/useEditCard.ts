import { toast } from "react-hot-toast";
import { supabase } from "src/Utils/supabase";
import { useState, useEffect, RefObject } from "react";

import { ColumnDefinition, ColumnType } from "../Utils/types";
import { processFormValue, formatColumnLabel } from "../Utils/functions";

interface UseEditCardProps<T> {
  tableName: string;
  columns: ColumnDefinition<T>[];
  selectedRow: T | null;
  reloadRef?: RefObject<{ reload: () => void; clearSelection: () => void } | null>;
}

export default function useEditCard<T extends Record<string, any>>({
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

  const handleChange = (key: keyof T, value: any, type: ColumnType) => {
    const processedValue = processFormValue(value, type);

    setFormData(prev => ({
      ...prev,
      [key]: processedValue,
    }));
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = e => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDimension = 1920;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          const tryCompress = (quality: number): void => {
            canvas.toBlob(
              blob => {
                if (!blob) {
                  reject(new Error("Failed to compress image"));
                  return;
                }

                if (blob.size <= 500 * 1024 || quality <= 0.1) {
                  const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
                    type: "image/webp",
                    lastModified: Date.now(),
                  });
                  resolve(compressedFile);
                } else {
                  tryCompress(Math.max(0.1, quality - 0.1));
                }
              },
              "image/webp",
              quality
            );
          };

          tryCompress(0.9);
        };
        img.onerror = () => reject(new Error("Failed to load image"));
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
    });
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
    } catch (error: any) {
      toast.error(error.message || "Failed to process image");
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

    const { data, error: urlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 3600);

    if (urlError || !data) {
      console.warn("Failed to generate signed URL:", urlError);
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      return publicUrl;
    }

    return data.signedUrl;
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const missingFields: string[] = [];
      columns.forEach(col => {
        if (col.optional === true) return;

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

      let finalFormData = { ...formData };
      if (
        pendingImageFile &&
        finalFormData.tags &&
        Array.isArray(finalFormData.tags) &&
        finalFormData.tags.length > 0
      ) {
        const uploadedUrl = await uploadImageFile(pendingImageFile, finalFormData.tags as string[]);
        (finalFormData as any).image = uploadedUrl;

        if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(imagePreviewUrl);
        }
        setPendingImageFile(null);
        setImagePreviewUrl(null);
      }

      const fieldsToExclude = ["id", "created_at", "updated_at"];
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
      const { error } = await supabase
        .from(tableName)
        .update({ deleted: true })
        .eq("id", formData.id);
      if (error) throw error;
      toast.success("Row deleted successfully");

      reloadRef?.current?.reload();
      reloadRef?.current?.clearSelection();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
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
