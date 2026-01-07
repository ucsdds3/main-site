import {
  FaCalendar,
  FaEnvelope,
  FaGraduationCap,
  FaUser,
  FaLink,
  FaGithub,
  FaLinkedin,
  FaInfoCircle,
} from "react-icons/fa";
import Page from "../../../Components/Page/Page";
import Section from "../../../Components/Section";
import { Input } from "../../../Components/Input";
import Avatar from "../Avatar";
import { useProfile } from "../../../Hooks/Members/useProfile";
import Select from "../../../Components/Select";
import majors from "../../../Assets/Data/majors.json";
import Button from "../../../Components/Button";
import { useForgotPassword } from "../../../Hooks/Members/Auth/useForgotPassword";

const Profile = () => {
  const { errors, data, setData, handleUpdateProfile } = useProfile();
  const { handleForgotPassword } = useForgotPassword();

  const getPdfPreviewUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.toLowerCase().endsWith(".pdf")) return url;
    const driveFileRegex = /https?:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match = url?.match(driveFileRegex);
    if (match && match[1]) return `https://drive.google.com/file/d/${match[1]}/preview`;
    return undefined;
  };

  const previewUrl = getPdfPreviewUrl(data?.resume_link);

  // Split full_name into first_name and last_name if not already split
  const firstName = data?.first_name || data?.full_name?.split(" ")[0] || "";
  const lastName = data?.last_name || data?.full_name?.split(" ").slice(1).join(" ") || "";

  const setFirstName = (value: string) => {
    setData({
      ...data,
      first_name: value,
      full_name: `${value} ${lastName}`.trim(),
    });
  };

  const setLastName = (value: string) => {
    setData({
      ...data,
      last_name: value,
      full_name: `${firstName} ${value}`.trim(),
    });
  };

  return (
    <Page>
      <Section className="flex-row flex-wrap items-center justify-center">
        <Avatar />

        <form
          className="flex-1 min-h-68 px-8 py-6 rounded-2xl bg-base-300 flex flex-col gap-4"
          onSubmit={handleUpdateProfile}
        >
          {/* NAME & EMAIL */}
          <div className="w-full flex flex-wrap gap-8">
            <Input
              required
              label="First Name"
              type="text"
              error={errors.toLowerCase().includes("name")}
              icon={<FaUser className="mr-2" />}
              value={firstName}
              setValue={setFirstName}
              className="flex-1 w-full md:w-auto"
            />
            <Input
              required
              label="Last Name"
              type="text"
              error={errors.toLowerCase().includes("name")}
              icon={<FaUser className="mr-2" />}
              value={lastName}
              setValue={setLastName}
              className="flex-1 w-full md:w-auto"
            />
            <Input
              required
              disabled
              label="UCSD Email"
              type="email"
              error={errors.toLowerCase().includes("email")}
              icon={<FaEnvelope className="mr-2" />}
              value={data?.email}
              setValue={(value: string) => setData({ ...data, email: value })}
              className="flex-1 w-full"
            />
          </div>

          {/* MAJOR & DOB */}
          <div className="w-full flex flex-wrap gap-8 mt-4">
            <Select
              required
              label="Major"
              options={[...majors, "Other"]}
              value={data?.major}
              setValue={(value: string) => setData({ ...data, major: value })}
              className="flex-1 w-full"
            />
            <Input
              required
              label="Date of Birth"
              type="date"
              icon={<FaCalendar className="mr-2" />}
              value={data?.date_of_birth}
              setValue={(value: string) => setData({ ...data, date_of_birth: value })}
              className="flex-1 w-full"
            />
          </div>

          {/* GENDER & GRADUATION YEAR */}
          <div className="w-full flex flex-wrap gap-8 mt-4">
            <Select
              required
              label="Gender"
              options={["Male", "Female", "Prefer not to say"]}
              value={data?.gender}
              setValue={(value: string) => setData({ ...data, gender: value })}
              className="flex-1 w-full"
            />
            <Input
              required
              label="Graduation Year"
              type="number"
              icon={<FaGraduationCap className="mr-2" />}
              value={data?.graduation_year?.toString()}
              setValue={(value: string) => setData({ ...data, graduation_year: parseInt(value) })}
              className="flex-1 w-full"
            />
          </div>

          {/* GRAD STUDENT & TALENT POOL */}
          <div className="w-full flex flex-wrap gap-8 mt-4">
            <div className="flex-1 flex items-center gap-2 ">
              <input
                type="checkbox"
                checked={data?.in_talent_pool || false}
                onChange={e => setData({ ...data, in_talent_pool: e.target.checked })}
                className=" cursor-pointer toggle toggle-primary"
              />
              <label className="text-lg cursor-pointer gap-2 flex items-center">
                <span
                  className="tooltip tooltip-right"
                  data-tip="By joining our Talent Pool, you will be added to our database for potential job opportunities and collaborations."
                >
                  <FaInfoCircle />
                </span>
                Join Talent Pool
              </label>
            </div>

            <div className="flex-1 flex items-center gap-2">
              <input
                type="checkbox"
                checked={data?.on_mailing_list || false}
                onChange={e => setData({ ...data, on_mailing_list: e.target.checked })}
                className="cursor-pointer toggle toggle-primary"
              />
              <label className="text-lg cursor-pointera flex items-center gap-2">
                <span
                  className="tooltip tooltip-right"
                  data-tip="By enrolling in our mailing list, you will receive updates about our events and opportunities."
                >
                  <FaInfoCircle />
                </span>{" "}
                Enroll in Mailing List
              </label>
            </div>

            <div className="flex-1 flex items-center gap-2">
              <input
                type="checkbox"
                checked={data?.is_grad_student || false}
                onChange={e => setData({ ...data, is_grad_student: e.target.checked })}
                className="cursor-pointer toggle toggle-primary"
              />
              <label className="text-lg cursor-pointer">I am a Graduate Student</label>
            </div>
          </div>

          {/* CONDITIONAL LINKS */}
          {data?.in_talent_pool && (
            <div className="w-full mt-4 flex flex-col md:flex-row gap-8">
              <div className="flex-1  flex flex-col gap-4">
                <Input
                  label="Resume Link (PDF)"
                  type="url"
                  placeholder="https://example.com/resume.pdf"
                  icon={<FaLink className="mr-2" />}
                  value={data?.resume_link || ""}
                  setValue={(value: string) => setData({ ...data, resume_link: value })}
                  className="flex-1 w-full"
                />
                <Input
                  label="GitHub Profile"
                  type="url"
                  placeholder="https://github.com/username"
                  icon={<FaGithub className="mr-2" />}
                  value={data?.github_link || ""}
                  setValue={(value: string) => setData({ ...data, github_link: value })}
                  className="flex-1 w-full"
                />
                <Input
                  label="LinkedIn Profile"
                  type="url"
                  placeholder="https://linkedin.com/username"
                  icon={<FaLinkedin className="mr-2" />}
                  value={data?.linkedin_link || ""}
                  setValue={(value: string) => setData({ ...data, linkedin_link: value })}
                  className="flex-1 w-full"
                />
                <Input
                  label="Other Link"
                  type="url"
                  placeholder="Portfolio, LinkedIn, personal site, etc."
                  icon={<FaLink className="mr-2" />}
                  value={data?.other_link || ""}
                  setValue={(value: string) => setData({ ...data, other_link: value })}
                  className="flex-1 w-full"
                />
              </div>

              <div className="flex-1 shrink-0 overflow-hidden flex items-center justify-center">
                {previewUrl ? (
                  <div className="w-[330px] aspect-[1/1.414] border rounded-lg pt-6">
                    <iframe
                      key={previewUrl}
                      src={previewUrl}
                      title="Resume Preview"
                      className=" size-full"
                      allow="autoplay"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[380px] w-[300px] text-gray-400 text-center">
                    <p>
                      Paste a public Google Drive PDF link or a direct PDF URL.{" "}
                      <span className="text-red-500 font-bold">
                        Confirm you can see a preview here
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap justify-around mt-6">
            <Button
              btnClass="text-[clamp(1rem,1.2vw,1.5rem)]"
              type="button"
              onClick={() => handleForgotPassword(undefined, data?.email)}
            >
              Change Password
            </Button>
            <Button btnClass="text-[clamp(1rem,1.2vw,1.5rem)]" type="submit">
              Update Profile
            </Button>
          </div>
        </form>
      </Section>
    </Page>
  );
};

export default Profile;
