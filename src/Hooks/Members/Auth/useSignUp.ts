import { useState } from "react";
import toast from "react-hot-toast";
import z from "zod";
import { supabase } from "../../../Utils/supabase";
import { useAuthStore } from "./useAuthStore";

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
    })
    .refine(data => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });

  const [errors, setErrors] = useState<string>("");
  const [data, setData] = useState<z.infer<typeof signupSchema>>(defaultSchema);
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

    setErrors("");
    const { data: userData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          email: data.email,
          full_name: data.fullName,
          major: data.major,
          date_of_birth: data.dateOfBirth,
          graduation_year: data.graduationYear,
          gender: data.gender,
          points: 0,
          experience: 0,
        },
        emailRedirectTo: `${href}${search && "&"}authState=signin`,
      },
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    const { error: rpcError } = await supabase.rpc("create_member_profile", {
      full_name: data.fullName,
      year: data.graduationYear,
      major: data.major,
      date_of_birth: data.dateOfBirth,
      gender: data.gender,
    });

    if (rpcError) {
      toast.error(rpcError.message);
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
