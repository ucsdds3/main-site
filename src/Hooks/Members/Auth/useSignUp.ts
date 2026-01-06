import { useState } from "react";
import toast from "react-hot-toast";
import z from "zod";
import { supabase } from "../../../Utils/supabase";
import { useAuthStore } from "./useAuthStore";

export type signUpForm = {
  email: string;
  full_name: string;
  password: string;
  confirm_password: string;
  major: string;
  date_of_birth: string;
  graduation_year: number;
  gender: string;
  in_talent_pool: boolean;
  on_mailing_list: boolean;
  is_grad_student: boolean;
  resume_link?: string;
  github_link?: string;
  other_link?: string;
  linkedin_link?: string;
};

export function useSignUp() {
  const defaultSchema = {
    email: "",
    full_name: "",
    password: "",
    confirm_password: "",
    major: "",
    date_of_birth: "",
    graduation_year: new Date().getFullYear(),
    gender: "",
    in_talent_pool: false,
    on_mailing_list: false,
    is_grad_student: false,
    resume_link: "",
    github_link: "",
    other_link: "",
    linkedin_link: "",
  };

  const signupSchema = z
    .object({
      email: z.email("Invalid email format").regex(/@ucsd\.edu$/, "Must be a UCSD email address"),

      full_name: z
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

      confirm_password: z.string(),

      major: z.string().refine(val => val !== defaultSchema.major, {
        message: "Please select a major",
      }),

      date_of_birth: z.string(),

      graduation_year: z
        .number()
        .min(
          defaultSchema.graduation_year,
          `Graduation year must be ${defaultSchema.graduation_year} or later`
        ),

      gender: z.string().refine(val => val !== defaultSchema.gender, {
        message: "Please select a gender",
      }),

      on_mailing_list: z.boolean(),
      is_grad_student: z.boolean(),
      in_talent_pool: z.boolean(),

      resume_link: z.preprocess(
        val => (val === "" ? undefined : val),
        z.url("Invalid resume link").optional()
      ),
      github_link: z.preprocess(
        val => (val === "" ? undefined : val),
        z.url("Invalid github link").optional()
      ),
      linkedin_link: z.preprocess(
        val => (val === "" ? undefined : val),
        z.url("Invalid linkedin link").optional()
      ),
      other_link: z.preprocess(
        val => (val === "" ? undefined : val),
        z.url("Invalid other link").optional()
      ),
    })
    .refine(data => data.password === data.confirm_password, {
      message: "Passwords don't match",
      path: ["confirm_password"],
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
      full_name: data.full_name,
      major: data.major,
      date_of_birth: data.date_of_birth,
      graduation_year: data.graduation_year,
      gender: data.gender,
      points: 0,
      xp: 0,
      is_grad_student: data.is_grad_student,
      in_talent_pool: data.in_talent_pool,
      on_mailing_list: data.on_mailing_list,
      resume_link: data.resume_link,
      github_link: data.github_link,
      linkedin_link: data.linkedin_link,
      other_link: data.other_link,
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
    //   full_name: data.full_name,
    //   year: data.graduation_year,
    //   major: data.major,
    //   date_of_birth: data.date_of_birth,
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
