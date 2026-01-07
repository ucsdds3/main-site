import z from "zod";
import { useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../Utils/supabase";
import { validateResumeLink } from "../../Utils/functions";
import { useAuthStore } from "./Auth/useAuthStore";

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
      in_talent_pool: z.boolean(),
      on_mailing_list: z.boolean(),
      is_grad_student: z.boolean(),

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

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!data) {
      toast.error("No data to update");
      return;
    }
    const result = signupSchema.safeParse(data);

    if (!result.success) {
      const errors = result.error.issues.map(issue => issue.message).join("\n");
      toast.error("Please fix the following errors:\n" + errors);
      console.log(errors);
      setErrors(errors);
      return;
    }

    const { error: memberError } = await supabase
      .from("Members")
      .update(data)
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
