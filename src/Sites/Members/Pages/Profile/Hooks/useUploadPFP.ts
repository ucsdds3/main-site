import { useState } from "react";
import toast from "react-hot-toast";

import { supabase } from "src/Utils/supabase";
import { compressImage } from "../../../Utils/functions";

import { useAuthStore } from "../../../Hooks/useAuthStore";

export function useUploadPFP() {
  const { user, setUser: setAuthUser } = useAuthStore();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  /**
   * Uploads a profile picture to Supabase Storage
   * @param file - The image file to upload (should be WebP format)
   * @param email - The user's email to use as the filename
   * @returns Promise resolving to the public URL of the uploaded image
   */
  const uploadProfilePicture = async (file: File, email: string): Promise<string> => {
    const bucketName = "Profile Pictures";
    // Use email as filename, sanitize it to be safe for file paths
    const sanitizedEmail = email.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${sanitizedEmail}.webp`;

    // Upload with upsert to allow overwriting existing profile pictures
    const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

    if (uploadError) {
      if (uploadError.message.includes("Bucket") || uploadError.message.includes("bucket")) {
        throw new Error(
          `Storage bucket "${bucketName}" not found. Please create a bucket named "${bucketName}" in your Supabase Storage settings.`
        );
      }
      throw uploadError;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(filePath);

    // Try to get signed URL as fallback (for private buckets)
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

  const handleAvatarUpload = async (
    file: File,
    currentData: Record<string, unknown> | undefined,
    setData: (data: Record<string, unknown>) => void
  ): Promise<void> => {
    if (!user?.email || !currentData) {
      toast.error("User email not found");
      return;
    }

    setUploadingAvatar(true);
    try {
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File is too large. Please use an image under 5MB.");
        return;
      }

      // Compress image to WebP
      const compressedFile = await compressImage(file);

      // Upload to Supabase Storage
      const imageUrl = await uploadProfilePicture(compressedFile, user.email);

      // Update user metadata
      const updatedMetadata = {
        ...currentData,
        profile_picture: imageUrl,
      };

      const { error: userError } = await supabase.auth.updateUser({
        data: updatedMetadata,
      });

      if (userError) {
        toast.error(userError.message);
        return;
      }

      // Update Members table (if profile_picture column exists)
      // Try to update using email first, which is how other profile updates work
      const { error: memberError } = await supabase
        .from("Members")
        .update({ profile_picture: imageUrl })
        .eq("email", user.email);

      if (memberError) {
        // If the error is about RLS or missing column, log it but don't fail the upload
        // The user metadata update is more important - profile_picture is stored there
        console.warn("Failed to update Members table:", memberError.message);
        // Don't return here - the user metadata was updated successfully
      }

      // Update local state
      setData(updatedMetadata);

      // Update auth store user
      if (user) {
        setAuthUser({
          ...user,
          user_metadata: {
            ...user.user_metadata,
            ...updatedMetadata,
          },
        });
      }

      toast.success("Profile picture updated successfully");
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to upload profile picture");
      console.error("Error uploading profile picture:", error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleClearPFP = async (
    currentData: Record<string, unknown> | undefined,
    setData: (data: Record<string, unknown>) => void
  ): Promise<void> => {
    if (!user?.email || !currentData) {
      toast.error("User email not found");
      return;
    }

    setUploadingAvatar(true);
    try {
      const bucketName = "Profile Pictures";
      const sanitizedEmail = user.email.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `${sanitizedEmail}.webp`;

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (deleteError && !deleteError.message.includes("not found")) {
        console.warn("Failed to delete profile picture from storage:", deleteError.message);
        // Continue anyway - we'll still clear it from metadata
      }

      // Remove profile_picture from user metadata
      const updatedMetadata = {
        ...currentData,
        profile_picture: null,
      };

      const { error: userError } = await supabase.auth.updateUser({
        data: updatedMetadata,
      });

      if (userError) {
        toast.error(userError.message);
        return;
      }

      // Update Members table (if profile_picture column exists)
      const { error: memberError } = await supabase
        .from("Members")
        .update({ profile_picture: null })
        .eq("email", user.email);

      if (memberError) {
        console.warn("Failed to update Members table:", memberError.message);
        // Don't return here - the user metadata was updated successfully
      }

      // Update local state
      setData(updatedMetadata);

      // Update auth store user
      if (user) {
        setAuthUser({
          ...user,
          user_metadata: {
            ...user.user_metadata,
            ...updatedMetadata,
          },
        });
      }

      toast.success("Profile picture cleared successfully");
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to clear profile picture");
      console.error("Error clearing profile picture:", error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  return {
    handleAvatarUpload,
    handleClearPFP,
    uploadingAvatar,
  };
}
