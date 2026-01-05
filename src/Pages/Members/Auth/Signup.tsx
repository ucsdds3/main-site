import {
  FaCalendar,
  FaEnvelope,
  FaGraduationCap,
  FaLock,
  FaUser,
} from "react-icons/fa";
import Button from "../../../Components/Button";
import {Input} from "../../../Components/Input";
import Page from "../../../Components/Page/Page";
import Select from "../../../Components/Select";
import majors from "../../../Assets/Data/majors.json";
import { useAuthStore } from "../../../Hooks/Members/Auth/useAuthStore";
import { useSignUp } from "../../../Hooks/Members/Auth/useSignUp";

const Signup = () => {
  const { setAuthState } = useAuthStore();
  const { errors, data, setData, handleSignup } = useSignUp();

  return (
    <Page>
      <form
        className="flex flex-col items-center justify-center w-full flex-1 py-20"
        onSubmit={handleSignup}
      >
        <h1 className="text-center hero-text-shadow text-[clamp(2.5rem,14vw,4.5rem)]">
          Welcome to DS3!
        </h1>
        <p className="text-center text-xl px-4">
          Create an account to join the DS3 community!
        </p>

        <div className="flex flex-col items-center justify-center my-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 flex flex-col items-start gap-6">
              <Input
                label="UCSD Email"
                type="email"
                required
                error={errors.toLowerCase().includes("email")}
                placeholder="jdoe@ucsd.edu"
                icon={<FaEnvelope className="mr-2" />}
                value={data.email}
                setValue={(value: string) => setData({ ...data, email: value })}
              />

              <Input
                label="Full Name"
                type="text"
                required
                error={errors.toLowerCase().includes("name")}
                placeholder="John Doe"
                icon={<FaUser className="mr-2" />}
                value={data.fullName}
                setValue={(value: string) =>
                  setData({ ...data, fullName: value })
                }
              />

              <Input
                label="Password"
                type="password"
                required
                error={errors.toLowerCase().includes("password")}
                placeholder="***************"
                icon={<FaLock className="mr-2" />}
                value={data.password}
                setValue={(value: string) =>
                  setData({ ...data, password: value })
                }
              />

              <Input
                label="Confirm Password"
                type="password"
                required
                error={errors.toLowerCase().includes("password")}
                placeholder="***************"
                icon={<FaLock className="mr-2" />}
                value={data.confirmPassword}
                setValue={(value: string) =>
                  setData({ ...data, confirmPassword: value })
                }
              />
            </div>

            <div className="flex-1 flex flex-col items-end gap-6">
              <Select
                label="Major"
                options={[...majors, "Other"]}
                required
                value={data.major}
                setValue={(value: string) => setData({ ...data, major: value })}
              />

              <Input
                label="Date of Birth"
                type="date"
                required
                icon={<FaCalendar className="mr-2" />}
                value={data.dateOfBirth}
                setValue={(value: string) =>
                  setData({ ...data, dateOfBirth: value })
                }
              />

              <Input
                label="Graduation Year"
                type="number"
                required
                icon={<FaGraduationCap className="mr-2" />}
                value={data.graduationYear?.toString()}
                setValue={(value: string) =>
                  setData({ ...data, graduationYear: parseInt(value) })
                }
              />

              <Select
                label="Gender"
                options={["Male", "Female", "Prefer not to say"]}
                required
                value={data.gender}
                setValue={(value: string) =>
                  setData({ ...data, gender: value })
                }
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between w-full text-lg mt-4">
            <p className="text-center">
              Already have an account?
              <a
                onClick={() => setAuthState("signin")}
                className="text-blue-400 hover:underline cursor-pointer ml-2"
              >
                Sign In
              </a>
            </p>

            <p
              className="text-center cursor-pointer hidden md:block"
              title="Because we're a Data Science club!"
            >
              Why do we collect so much data? (Hover)
            </p>
          </div>
        </div>

        <Button
          btnClass="text-[clamp(1rem,1vw,1.5rem)]"
          type="submit"
          onClick={() => {}}
        >
          Sign Up
        </Button>
      </form>
    </Page>
  );
};

export default Signup;
