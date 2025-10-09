import z from "zod";
import { useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../Utils/supabase";
import { useAuthStore } from "./Auth/useAuthStore";

export function useProfile() {
  const signupSchema = z.object({
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
  });

  const { user } = useAuthStore();
  const [data, setData] = useState(user?.user_metadata);
  const [errors, setErrors] = useState<string>("");

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const memberData = {
      email: data?.email,
      full_name: data?.full_name,
      major: data?.major,
      date_of_birth: data?.date_of_birth,
      graduation_year: data?.graduation_year,
      gender: data?.gender,
    };

    const result = signupSchema.safeParse(memberData);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => issue.message).join("\n");
      toast.error("Please fix the following errors:\n" + errors);
      console.log(errors);
      setErrors(errors);
      return;
    }

    const { error: memberError } = await supabase
      .from("Members")
      .update(memberData)
      .eq("email", data?.email);
    if (memberError) {
      toast.error(memberError.message);
      return;
    }

    const { error: userError } = await supabase.auth.updateUser({ email: data?.email, data });
    if (userError) {
      toast.error(userError.message);
      return;
    }

    toast.success("Profile updated successfully");
  };

  return {
    data,
    errors,
    setData,
    handleUpdateProfile,
  };
}
