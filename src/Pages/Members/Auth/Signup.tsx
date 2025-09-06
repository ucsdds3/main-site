import { z } from "zod";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaCalendar, FaEnvelope, FaGraduationCap, FaLock, FaUser } from "react-icons/fa";

import Button from "../../../Components/Button";
import Input from "../../../Components/Input";
import Page from "../../../Components/Page/Page";
import Select from "../../../Components/Select";
import majors from "../../../Assets/Data/majors.json";
import { supabase } from "../../../Utils/supabase";
import { useAuthStore } from "../../../Hooks/useAuth";

const signupSchema = z
  .object({
    email: z
      .string()
      .email("Invalid email format")
      .regex(/@ucsd\.edu$/, "Must be a UCSD email address"),

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

    major: z.string().optional(),

    dateOfBirth: z.string().optional(),

    graduationYear: z
      .number()
      .min(2024, "Graduation year must be 2024 or later")
      .max(2030, "Graduation year must be 2030 or earlier")
      .optional(),

    gender: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const Signup = () => {
  const { setAuthState, setUser } = useAuthStore();

  const [errors, setErrors] = useState<string>("");
  const [data, setData] = useState<z.infer<typeof signupSchema>>({
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
    major: "",
    dateOfBirth: "",
    graduationYear: new Date().getFullYear(),
    gender: "",
  });

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = signupSchema.safeParse(data);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => issue.message).join("\n");
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
          full_name: data.fullName,
          major: data.major,
          date_of_birth: data.dateOfBirth,
          graduation_year: data.graduationYear,
          gender: data.gender,
        },
        emailRedirectTo: `${href}${search && "&"}authState=signin`,
      },
    });
    
    if (error) {
      toast.error(error.message);
      return;
    }

    console.log(userData);
    setUser(userData.user);
    setAuthState("signin");
    toast.success("Please check your email for verification!");
  };

  return (
    <Page>
      <form className="flex flex-col items-center justify-center w-full flex-1 py-20" onSubmit={handleSignup}>
        <h1 className="text-center hero-text-shadow text-[clamp(2.5rem,14vw,4.5rem)]">
          Welcome to DS3!
        </h1>
        <p className="text-center text-xl">Create an account to join the DS3 community!</p>

        <div className="flex flex-col items-center justify-center my-8">
          <div className="flex gap-8">
            <div className="flex-1 flex flex-col items-start gap-6">
              <Input
                label="UCSD Email"
                type="email"
                error={errors.toLowerCase().includes("email")}
                placeholder="jdoe@ucsd.edu"
                icon={<FaEnvelope className="mr-2" />}
                value={data.email}
                setValue={(value: string) => setData({ ...data, email: value })}
              />

              <Input
                label="Full Name"
                type="text"
                error={errors.toLowerCase().includes("name")}
                placeholder="John Doe"
                icon={<FaUser className="mr-2" />}
                value={data.fullName}
                setValue={(value: string) => setData({ ...data, fullName: value })}
              />

              <Input
                label="Password"
                type="password"
                error={errors.toLowerCase().includes("password")}
                placeholder="***************"
                icon={<FaLock className="mr-2" />}
                value={data.password}
                setValue={(value: string) => setData({ ...data, password: value })}
              />

              <Input
                label="Confirm Password"
                type="password"
                error={errors.toLowerCase().includes("password")}
                placeholder="***************"
                icon={<FaLock className="mr-2" />}
                value={data.confirmPassword}
                setValue={(value: string) => setData({ ...data, confirmPassword: value })}
              />
            </div>

            <div className="flex-1 flex flex-col items-end gap-6">
              <Select
                label="Major"
                options={["Select Major", ...majors, "Other"]}
                value={data.major}
                setValue={(value: string) => setData({ ...data, major: value })}
              />

              <Input
                label="Date of Birth"
                type="date"
                required={false}
                icon={<FaCalendar className="mr-2" />}
                value={data.dateOfBirth}
                setValue={(value: string) => setData({ ...data, dateOfBirth: value })}
              />

              <Input
                label="Graduation Year"
                type="number"
                required={false}
                icon={<FaGraduationCap className="mr-2" />}
                value={data.graduationYear?.toString()}
                setValue={(value: string) => setData({ ...data, graduationYear: parseInt(value) })}
              />

              <Select
                label="Gender"
                options={["Select Gender", "Male", "Female", "Prefer not to say"]}
                value={data.gender}
                setValue={(value: string) => setData({ ...data, gender: value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between w-full text-lg mt-4">
            <p className="text-center">
              Already have an account?
              <a
                onClick={() => setAuthState("signin")}
                className="text-blue-400 hover:underline cursor-pointer ml-2"
              >
                Sign In
              </a>
            </p>

            <p className="text-center cursor-pointer" title="Because we're a Data Science club!">
              Why do we collect so much data? (Hover)
            </p>
          </div>
        </div>

        <Button btnClass="text-[clamp(1rem,1vw,1.5rem)]" type="submit" onClick={() => {}}>
          Sign Up
        </Button>
      </form>
    </Page>
  );
};

export default Signup;
