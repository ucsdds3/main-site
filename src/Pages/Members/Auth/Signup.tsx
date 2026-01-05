import {
  FaCalendar,
  FaEnvelope,
  FaGraduationCap,
  FaLock,
  FaUser,
  FaLink,
  FaGithub,
} from "react-icons/fa";
import Button from "../../../Components/Button";
import { Input } from "../../../Components/Input";
import Page from "../../../Components/Page/Page";
import Select from "../../../Components/Select";
import majors from "../../../Assets/Data/majors.json";
import { useAuthStore } from "../../../Hooks/Members/Auth/useAuthStore";
import { useSignUp } from "../../../Hooks/Members/Auth/useSignUp";

const Signup = () => {
  const { setAuthState } = useAuthStore();
  const { errors, data, setData, handleSignup } = useSignUp();
  const getPdfPreviewUrl = (url?: string) => {
    if (!url) return undefined;

    // Direct PDF
    if (url.toLowerCase().endsWith(".pdf")) {
      return url;
    }

    // Google Drive file link (robust)
    const driveFileRegex = /https?:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;

    const match = url.match(driveFileRegex);

    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }

    return undefined;
  };
  const previewUrl = getPdfPreviewUrl(data.resumeLink);
  return (
    <Page>
      <form
        className="flex flex-col items-center justify-center w-full flex-1 py-20"
        onSubmit={handleSignup}
      >
        <h1 className="text-center hero-text-shadow text-[clamp(2.5rem,14vw,4.5rem)]">
          Welcome to DS3!
        </h1>
        <p className="text-center text-xl px-4">Create an account to join the DS3 community!</p>

        <div className="flex flex-col items-center justify-center my-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* LEFT COLUMN */}
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
                label="First Name"
                type="text"
                required
                error={errors.toLowerCase().includes("name")}
                placeholder="John Doe"
                icon={<FaUser className="mr-2" />}
                value={data.firstName}
                setValue={(value: string) => setData({ ...data, firstName: value })}
              />
              <Input
                label="Last Name"
                type="text"
                required
                error={errors.toLowerCase().includes("name")}
                placeholder="John Doe"
                icon={<FaUser className="mr-2" />}
                value={data.lastName}
                setValue={(value: string) => setData({ ...data, lastName: value })}
              />

              <Input
                label="Password"
                type="password"
                required
                error={errors.toLowerCase().includes("password")}
                placeholder="***************"
                icon={<FaLock className="mr-2" />}
                value={data.password}
                setValue={(value: string) => setData({ ...data, password: value })}
              />

              <Input
                label="Confirm Password"
                type="password"
                required
                error={errors.toLowerCase().includes("password")}
                placeholder="***************"
                icon={<FaLock className="mr-2" />}
                value={data.confirmPassword}
                setValue={(value: string) => setData({ ...data, confirmPassword: value })}
              />
            </div>

            {/* RIGHT COLUMN */}
            <div className="flex-1 flex flex-col items-end gap-6">
              <Input
                label="Date of Birth"
                type="date"
                required
                icon={<FaCalendar className="mr-2" />}
                value={data.dateOfBirth}
                setValue={(value: string) => setData({ ...data, dateOfBirth: value })}
              />

              <Select
                label="Gender"
                options={["Male", "Female", "Prefer not to say"]}
                required
                value={data.gender}
                setValue={(value: string) => setData({ ...data, gender: value })}
              />
              <Input
                label="Graduation Year"
                type="number"
                required
                icon={<FaGraduationCap className="mr-2" />}
                value={data.graduationYear?.toString()}
                setValue={(value: string) => setData({ ...data, graduationYear: parseInt(value) })}
              />
              <Select
                label="Major"
                options={[...majors, "Other"]}
                required
                value={data.major}
                setValue={(value: string) => setData({ ...data, major: value })}
              />
              <div className="w-full mt-8 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={data.gradStudent || false}
                  onChange={e => setData({ ...data, gradStudent: e.target.checked })}
                  className="w-5 h-5 cursor-pointer"
                />
                <label className="text-lg cursor-pointer">Are you a Graduate student?</label>
              </div>
            </div>
          </div>

          {/* CHECKBOX */}
          <div className="w-full mt-8 flex items-center gap-3">
            <input
              type="checkbox"
              checked={data.addLinks || false}
              onChange={e => setData({ ...data, addLinks: e.target.checked })}
              className="w-5 h-5 cursor-pointer"
            />
            <label className="text-lg cursor-pointer">Join our Talent pool (Optional)</label>
          </div>

          {/* CONDITIONAL LINK FIELDS */}
          {data.addLinks && (
            <div className="w-full mt-6 flex flex-col md:flex-row gap-8">
              {/* LEFT: LINK INPUTS */}
              <div className="flex-1 flex flex-col gap-6">
                <Input
                  label="Resume Link (PDF)"
                  type="url"
                  placeholder="https://example.com/resume.pdf"
                  icon={<FaLink className="mr-2" />}
                  value={data.resumeLink || ""}
                  setValue={(value: string) => setData({ ...data, resumeLink: value })}
                />

                <Input
                  label="GitHub Profile"
                  type="url"
                  placeholder="https://github.com/username"
                  icon={<FaGithub className="mr-2" />}
                  value={data.githubLink || ""}
                  setValue={(value: string) => setData({ ...data, githubLink: value })}
                />

                <Input
                  label="Other Link"
                  type="url"
                  placeholder="Portfolio, LinkedIn, personal site, etc."
                  icon={<FaLink className="mr-2" />}
                  value={data.otherLink || ""}
                  setValue={(value: string) => setData({ ...data, otherLink: value })}
                />
              </div>

              {/* RIGHT: PDF PREVIEW */}
              <div className="flex-1 border rounded-lg overflow-hidden ">
                {previewUrl ? (
                  <iframe
                    key={previewUrl} // IMPORTANT: forces reload when URL changes
                    src={previewUrl}
                    title="Resume Preview"
                    className="w-[300px] h-[380px]"
                    allow="autoplay"
                  />
                ) : (
                  <div className="flex items-center justify-center h-[380px] w-[300px] text-gray-400 text-center">
                    <p>Paste a public Google Drive PDF link or a direct PDF URL.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row items-center justify-between w-full text-lg mt-6">
            <p className="text-center">
              Already have an account?
              <a
                onClick={() => setAuthState("signin")}
                className="text-blue-400 hover:underline cursor-pointer ml-2"
              >
                Sign In
              </a>
            </p>
          </div>
        </div>

        <Button btnClass="text-[clamp(1rem,1vw,1.5rem)]" type="submit">
          Sign Up
        </Button>
      </form>
    </Page>
  );
};

export default Signup;
