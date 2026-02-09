import z from "zod";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

import { supabase } from "src/Utils/supabase";
import { validateResumeLink } from "src/Utils/functions";

import { useAuthStore } from "../../../Hooks/useAuthStore";

export function useProfile() {
  const signupSchema = z
    .object({
      email: z.email("Invalid email format").regex(/@ucsd\.edu$/, "Must be a UCSD email address"),
      full_name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be less than 100 characters"),
      major: z.string(),
      date_of_birth: z.string(),
      graduation_year: z
        .number()
        .min(
          new Date().getFullYear(),
          `Graduation year must be ${new Date().getFullYear()} or later`
        ),
      gender: z.string(),
      in_talent_pool: z.boolean().optional().default(true),
      on_mailing_list: z.boolean().optional().default(false),
      is_grad_student: z.boolean().optional().default(false),

      resume_link: z.preprocess(
        val => (val === "" ? undefined : val),
        z.url("Invalid resume link").optional()
      ),
      linkedin_link: z.preprocess(
        val => (val === "" ? undefined : val),
        z.url("Invalid linkedin link").optional()
      ),
      github_link: z.preprocess(
        val => (val === "" ? undefined : val),
        z.url("Invalid github link").optional()
      ),
      other_link: z.preprocess(
        val => (val === "" ? undefined : val),
        z.url("Invalid other link").optional()
      ),
    })
    .refine(data => validateResumeLink(data.in_talent_pool, data.resume_link), {
      message: "A valid resume link URL is required when joining the talent pool",
      path: ["resume_link"],
    });

  const { user } = useAuthStore();
  const [data, setData] = useState(user?.user_metadata);
  const [errors, setErrors] = useState<string>("");
  const originalDataRef = useRef<string | null>(null);
  const hasUnsavedChangesRef = useRef(false);
  const isInitializedRef = useRef(false);
  const toastIdRef = useRef<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>): Promise<boolean> => {
    e.preventDefault();

    if (!data) {
      toast.error("No data to update");
      return false;
    }
    const result = signupSchema.safeParse(data);

    if (!result.success) {
      const errors = result.error.issues.map(issue => issue.message).join("\n");
      toast.error("Please fix the following errors:\n" + errors);
      console.log(errors);
      setErrors(errors);
      return false;
    }

    // Filter data to only include Members table fields (exclude password fields)
    const allowedFields = Object.keys(signupSchema.shape).filter(
      key => key !== "password" && key !== "confirm_password"
    );
    const memberUpdateData = Object.fromEntries(
      Object.entries(data).filter(([key]) => allowedFields.includes(key))
    );

    const { error: memberError } = await supabase
      .from("Members")
      .update(memberUpdateData)
      .eq("email", data?.email);
    if (memberError) {
      toast.error(memberError.message);
      return false;
    }

    const { error: userError, data: updatedUser } = await supabase.auth.updateUser({ email: data?.email, data });
    if (userError) {
      toast.error(userError.message);
      return false;
    }

    // Update local state with the updated user metadata
    if (updatedUser?.user?.user_metadata) {
      const updatedMetadata = updatedUser.user.user_metadata;
      setData(updatedMetadata);
      // Immediately update originalDataRef to prevent showing unsaved changes
      originalDataRef.current = JSON.stringify(updatedMetadata);
      hasUnsavedChangesRef.current = false;
    }

    toast.success("Profile updated successfully");
    return true;
  };

  useEffect(() => {
    if (data && !isInitializedRef.current) {
      originalDataRef.current = JSON.stringify(data);
      isInitializedRef.current = true;
    }
  }, [data]);

  useEffect(() => {
    if (data && originalDataRef.current && isInitializedRef.current) {
      const currentDataStr = JSON.stringify(data);
      hasUnsavedChangesRef.current = currentDataStr !== originalDataRef.current;

      if (hasUnsavedChangesRef.current) {
        if (!toastIdRef.current) {
          toastIdRef.current = toast.error(
            "You have unsaved changes. Make sure to click Update Profile.",
            {
              id: "unsaved-changes",
              duration: Infinity,
              icon: "⚠️",
            }
          );
        }
      } else {
        if (toastIdRef.current) {
          toast.dismiss(toastIdRef.current);
          toastIdRef.current = null;
        }
      }
    }
  }, [data]);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const result = await handleUpdateProfile(e);
    if (result === true) {
      // Dismiss the unsaved changes toast immediately by ID
      toast.dismiss("unsaved-changes");
      toastIdRef.current = null;
    }
  };

  return {
    data,
    errors,
    setData,
    handleUpdateProfile: handleFormSubmit,
  };
}
