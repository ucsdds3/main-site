import { useState } from "react";
import toast from "react-hot-toast";
import z from "zod";
import { supabase } from "../../../Utils/supabase";
import { useAuthStore } from "./useAuthStore";

export type signUpForm = {
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
  major: string;
  dateOfBirth: string;
  graduationYear: number;
  gender: string;
  talentPool: boolean;
  gradStudent: boolean;
  resumeLink?: string;
  githubLink?: string;
  otherLink?: string;
  linkedinLink?: string;
};

export function useSignUp() {
  const defaultSchema = {
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
    major: "",
    dateOfBirth: "",
    graduationYear: new Date().getFullYear(),
    gender: "",
    talentPool: false,
    gradStudent: false,
    resumeLink: "",
    githubLink: "",
    otherLink: "",
    linkedinLink: "",
  };

  const signupSchema = z
    .object({
      email: z.email("Invalid email format").regex(/@ucsd\.edu$/, "Must be a UCSD email address"),

      fullName: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be less than 100 characters"),

      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          "Password must contain lowercase, uppercase, and number"
        ),

      confirmPassword: z.string(),

      major: z.string().refine(val => val !== defaultSchema.major, {
        message: "Please select a major",
      }),

      dateOfBirth: z.string(),

      graduationYear: z
        .number()
        .min(
          defaultSchema.graduationYear,
          `Graduation year must be ${defaultSchema.graduationYear} or later`
        ),

      gender: z.string().refine(val => val !== defaultSchema.gender, {
        message: "Please select a gender",
      }),

      gradStudent: z.boolean(),
      talentPool: z.boolean(),

      resumeLink: z.preprocess(
        val => (val === "" ? undefined : val),
        z.url("Invalid resume link").optional()
      ),
      githubLink: z.preprocess(
        val => (val === "" ? undefined : val),
        z.url("Invalid github link").optional()
      ),
      linkedinLink: z.preprocess(
        val => (val === "" ? undefined : val),
        z.url("Invalid linkedin link").optional()
      ),
      otherLink: z.preprocess(
        val => (val === "" ? undefined : val),
        z.url("Invalid other link").optional()
      ),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });

  const [errors, setErrors] = useState<string>("");
  const [data, setData] = useState<signUpForm>(defaultSchema);
  const { setUser, setAuthState, setAdminLevel } = useAuthStore();

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = signupSchema.safeParse(data);

    if (!result.success) {
      const errors = result.error.issues.map(issue => issue.message).join("\n");
      toast.error("Please fix the following errors:\n" + errors);
      console.log(errors);
      setErrors(errors);
      return;
    }

    const href = window.location.href;
    const search = new URLSearchParams(window.location.search);
    const formData = {
      email: data.email,
      full_name: data.fullName,
      major: data.major,
      date_of_birth: data.dateOfBirth,
      graduation_year: data.graduationYear,
      gender: data.gender,
      points: 0,
      xp: 0,
      is_grad_student: data.gradStudent,
      in_talent_pool: data.talentPool,
      resume_link: data.resumeLink,
      github_link: data.githubLink,
      linkedin_link: data.linkedinLink,
      other_link: data.otherLink,
    };
    setErrors("");
    const { data: userData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: formData,
        emailRedirectTo: `${href}${search && "&"}authState=signin`,
      },
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    // const { error: rpcError } = await supabase.rpc("create_member_profile", {
    //   full_name: data.fullName,
    //   year: data.graduationYear,
    //   major: data.major,
    //   date_of_birth: data.dateOfBirth,
    //   gender: data.gender,
    // });
    const { error: createMemberProfileError } = await supabase.from("Members").insert(formData);
    if (createMemberProfileError) {
      toast.error(createMemberProfileError.message);
      return;
    }

    console.log(userData);
    setUser(userData.user);
    setAdminLevel(0);
    setAuthState("signin");
    // toast.success("Please check your email for verification!");
  };

  return {
    errors,
    data,
    setData,
    handleSignup,
  };
}
