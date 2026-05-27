import z from "zod";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { User } from "@supabase/supabase-js";

import { supabase } from "src/Utils/supabase";
import { validateResumeLink } from "src/Utils/functions";

import { useAuthStore } from "../../../Hooks/useAuthStore";

type ProfileData = {
  email?: string;
  full_name?: string;
  major?: string;
  date_of_birth?: string;
  graduation_year?: number;
  gender?: string;
  in_talent_pool?: boolean;
  on_mailing_list?: boolean;
  is_grad_student?: boolean;
  resume_link?: string;
  github_link?: string;
  linkedin_link?: string;
  other_link?: string;
  pending_email?: string | null;
  profile_picture?: string;
};

function buildProfileData(user: User): ProfileData {
  return {
    ...user.user_metadata,
    email: user.email ?? user.user_metadata?.email,
  };
}

export function useProfile() {
  const signupSchema = z
    .object({
      email: z.email("Invalid email format"),
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
      in_talent_pool: z.boolean().optional().default(false),
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

  const { user, setUser } = useAuthStore();
  const [data, setData] = useState<ProfileData | undefined>(() =>
    user ? buildProfileData(user) : undefined
  );
  const [errors, setErrors] = useState<string>("");
  const originalDataRef = useRef<string | null>(null);
  const hasUnsavedChangesRef = useRef(false);
  const isInitializedRef = useRef(false);
  const toastIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (user && !isInitializedRef.current) {
      const profileData = buildProfileData(user);
      setData(profileData);
      originalDataRef.current = JSON.stringify(profileData);
      isInitializedRef.current = true;
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>): Promise<boolean> => {
    e.preventDefault();

    if (!data || !user?.email) {
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

    const currentAuthEmail = user.email.toLowerCase();
    const normalizedEmail = (data.email as string).toLowerCase();
    const emailChanged = normalizedEmail !== currentAuthEmail;

    if (emailChanged) {
      const { data: exists, error: lookupError } = await supabase.rpc(
        "check_member_email_exists",
        { check_email: normalizedEmail }
      );

      if (lookupError) {
        toast.error(lookupError.message);
        return false;
      }
      if (exists) {
        toast.error("An account already exists with that email address.");
        return false;
      }
    }

    const allowedFields = Object.keys(signupSchema.shape).filter(
      key => key !== "password" && key !== "confirm_password"
    );
    const memberUpdateData = Object.fromEntries(
      Object.entries(data).filter(([key]) => allowedFields.includes(key))
    );

    if (emailChanged) {
      delete memberUpdateData.email;
    } else {
      memberUpdateData.email = normalizedEmail;
    }

    const { error: memberError } = await supabase
      .from("Members")
      .update(memberUpdateData)
      .eq("email", currentAuthEmail);
    if (memberError) {
      toast.error(memberError.message);
      return false;
    }

    const confirmedEmail = user.email;
    const metadataUpdate = emailChanged
      ? { ...data, email: confirmedEmail, pending_email: normalizedEmail }
      : { ...data, email: normalizedEmail };

    const { error: userError, data: updatedUser } = await supabase.auth.updateUser(
      emailChanged
        ? { email: normalizedEmail, data: metadataUpdate }
        : { data: metadataUpdate }
    );
    if (userError) {
      toast.error(userError.message);
      return false;
    }

    if (updatedUser?.user) {
      const formData = emailChanged
        ? { ...metadataUpdate, email: confirmedEmail }
        : { ...metadataUpdate, email: normalizedEmail };
      setData(formData);
      originalDataRef.current = JSON.stringify(formData);
      setUser(updatedUser.user);
      hasUnsavedChangesRef.current = false;
    }

    setErrors("");
    if (emailChanged) {
      toast.success(
        "Profile updated. Check your new email inbox and click the confirmation link to complete the email change.",
        { duration: 6000 }
      );
    } else {
      toast.success("Profile updated successfully");
    }
    return true;
  };

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
      toast.dismiss("unsaved-changes");
      toastIdRef.current = null;
    }
  };

  return {
    data,
    errors,
    setData,
    handleUpdateProfile: handleFormSubmit,
    pendingEmail: user?.new_email ?? null,
  };
}
