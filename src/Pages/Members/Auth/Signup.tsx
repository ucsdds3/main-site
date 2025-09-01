import { useState } from "react";
import { FaCalendar, FaGraduationCap, FaLock, FaUser } from "react-icons/fa";

import Button from "../../../Components/Button";
import Input from "../../../Components/Input";
import Page from "../../../Components/Page/Page";
import Select from "../../../Components/Select";
import majors from "../../../Assets/Data/majors.json";

const Signin = ({ setAuthState }: { setAuthState: (state: string) => void }) => {
  const [error] = useState<string>("");

  return (
    <Page>
      <form className="flex flex-col items-center justify-center w-full flex-1 py-20">
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
                error={error == "email"}
                placeholder="jdoe@ucsd.edu"
                icon={<FaUser className="mr-2" />}
              />

              <Input
                label="Full Name"
                type="text"
                error={error == "name"}
                placeholder="John Doe"
                icon={<FaUser className="mr-2" />}
              />

              <Input
                label="Password"
                type="password"
                error={error == "password"}
                placeholder="***************"
                icon={<FaLock className="mr-2" />}
              />

              <Input
                label="Confirm Password"
                type="password"
                error={error == "password"}
                placeholder="***************"
                icon={<FaLock className="mr-2" />}
              />
            </div>

            <div className="flex-1 flex flex-col items-end gap-6">
              <Select
                label="Major"
                options={["Select Major", ...majors, "Other"]}
              />

              <Input
                label="Date of Birth"
                type="date"
                required={false}
                placeholder="01/01/2000"
                icon={<FaCalendar className="mr-2" />}
              />

              <Input
                label="Graduation Year"
                type="number"
                required={false}
                placeholder="2025"
                icon={<FaGraduationCap className="mr-2" />}
              />

              <Select
                label="Gender"
                options={["Select Gender", "Male", "Female", "Prefer not to say"]}
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

        <Button btnClass="text-[clamp(0.8rem,1vw,1.5rem)]" onClick={() => {}}>
          Sign Up
        </Button>
      </form>
    </Page>
  );
};

export default Signin;
