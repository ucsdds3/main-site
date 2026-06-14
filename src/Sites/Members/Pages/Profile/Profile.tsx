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

import Page from "src/Shared/Page/Page";
import Section from "src/Shared/Page/Section";
import Button from "src/Shared/Components/Button";
import { useForgotPassword } from "src/Sites/Members/Pages/Auth/Hooks/useForgotPassword";

import { Input } from "../../Components/Input";
import Select from "../../Components/Select";
import majors from "../../Data/majors.json";
import Avatar from "../Home/Components/Avatar";
import { useProfile } from "./Hooks/useProfile";
import { getPdfPreviewUrl } from "../../Utils/functions";

const Profile = () => {
  const { errors, data, setData, handleUpdateProfile } = useProfile();
  const { handleForgotPassword } = useForgotPassword();

  const previewUrl = getPdfPreviewUrl(data?.resume_link);

  return (
    <Page>
      <Section className="flex-col items-center justify-center gap-6">
        <form className="w-full flex flex-col gap-6" onSubmit={handleUpdateProfile}>
          <div className="flex flex-col xl:flex-row items-center justify-center gap-6">
            <div className="shrink-0">
              <Avatar updatable data={data} setData={setData} />
            </div>

            {/* BASIC PROFILE CARD */}
            <div className="obs-panel flex w-full flex-col gap-4 px-8 py-6">
              {/* NAME & EMAIL */}
              <div className="flex w-full flex-wrap gap-4">
                <Input
                  required
                  label="First Name"
                  type="text"
                  error={errors.toLowerCase().includes("name")}
                  icon={<FaUser className="mr-2 shrink-0 text-(--obs-text-muted)" />}
                  value={data?.full_name}
                  setValue={(value: string) => setData({ ...data, full_name: value })}
                  className="flex-1 w-full md:w-auto"
                />
                <Input
                  required
                  label="Email"
                  type="email"
                  error={errors.toLowerCase().includes("email")}
                  icon={<FaEnvelope className="mr-2 shrink-0 text-(--obs-text-muted)" />}
                  value={data?.email}
                  setValue={(value: string) => setData({ ...data, email: value })}
                  className="flex-1 w-full"
                />
              </div>

              {/* MAJOR & DOB */}
              <div className="mt-4 flex w-full flex-wrap gap-8">
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
                  icon={<FaCalendar className="mr-2 shrink-0 text-(--obs-text-muted)" />}
                  value={data?.date_of_birth}
                  setValue={(value: string) => setData({ ...data, date_of_birth: value })}
                  className="flex-1 w-full"
                />
              </div>

              {/* GENDER & GRADUATION YEAR */}
              <div className="mt-4 flex w-full flex-wrap gap-8">
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
                  icon={<FaGraduationCap className="mr-2 shrink-0 text-(--obs-text-muted)" />}
                  value={data?.graduation_year?.toString()}
                  setValue={(value: string) =>
                    setData({ ...data, graduation_year: parseInt(value) })
                  }
                  className="flex-1 w-full"
                />
              </div>

              {/* TOGGLES */}
              <div className="mt-4 flex w-full flex-wrap gap-8">
                <div className="flex flex-1 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={data?.in_talent_pool || false}
                    onChange={e => setData({ ...data, in_talent_pool: e.target.checked })}
                    className=" cursor-pointer toggle toggle-primary"
                  />
                  <label className="flex cursor-pointer items-center gap-2 text-base text-(--obs-text-primary)">
                    <span
                      className="tooltip tooltip-right"
                      data-tip="By joining our Talent Pool, you will be added to our database for potential job opportunities and collaborations."
                    >
                      <FaInfoCircle />
                    </span>
                    Join Talent Pool
                  </label>
                </div>

                <div className="flex flex-1 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={data?.on_mailing_list || false}
                    onChange={e => setData({ ...data, on_mailing_list: e.target.checked })}
                    className="cursor-pointer toggle toggle-primary"
                  />
                  <label className="flex cursor-pointer items-center gap-2 text-base text-(--obs-text-primary)">
                    <span
                      className="tooltip tooltip-right"
                      data-tip="By enrolling in our mailing list, you will receive updates about our events and opportunities."
                    >
                      <FaInfoCircle />
                    </span>{" "}
                    Enroll in Mailing List
                  </label>
                </div>

                <div className="flex flex-1 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={data?.is_grad_student || false}
                    onChange={e => setData({ ...data, is_grad_student: e.target.checked })}
                    className="cursor-pointer toggle toggle-primary"
                  />
                  <label className="cursor-pointer text-base text-(--obs-text-primary)">
                    I am a Graduate Student
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* TALENT POOL LINKS CARD */}
          {data?.in_talent_pool && (
            <div className="obs-panel flex w-full flex-col gap-4 px-8 py-6">
              <div className="flex w-full flex-col gap-8 md:flex-row">
                <div className="flex flex-1 flex-col gap-4">
                  <Input
                    label="Resume Link (PDF)"
                    type="url"
                    placeholder="https://example.com/resume.pdf"
                    icon={<FaLink className="mr-2 shrink-0 text-(--obs-text-muted)" />}
                    value={data?.resume_link || ""}
                    setValue={(value: string) => setData({ ...data, resume_link: value })}
                    className="flex-1 w-full"
                  />
                  <Input
                    label="GitHub Profile"
                    type="url"
                    placeholder="https://github.com/username"
                    icon={<FaGithub className="mr-2 shrink-0 text-(--obs-text-muted)" />}
                    value={data?.github_link || ""}
                    setValue={(value: string) => setData({ ...data, github_link: value })}
                    className="flex-1 w-full"
                  />
                  <Input
                    label="LinkedIn Profile"
                    type="url"
                    placeholder="https://linkedin.com/username"
                    icon={<FaLinkedin className="mr-2 shrink-0 text-(--obs-text-muted)" />}
                    value={data?.linkedin_link || ""}
                    setValue={(value: string) => setData({ ...data, linkedin_link: value })}
                    className="flex-1 w-full"
                  />
                  <Input
                    label="Other Link"
                    type="url"
                    placeholder="Portfolio, LinkedIn, personal site, etc."
                    icon={<FaLink className="mr-2 shrink-0 text-(--obs-text-muted)" />}
                    value={data?.other_link || ""}
                    setValue={(value: string) => setData({ ...data, other_link: value })}
                    className="flex-1 w-full"
                  />
                </div>

                <div className="flex flex-1 shrink-0 items-center justify-center overflow-hidden">
                  {previewUrl ? (
                    <div className="obs-panel aspect-[1/1.414] w-[330px] overflow-hidden p-0 pt-6">
                      <iframe
                        key={previewUrl}
                        src={previewUrl}
                        title="Resume Preview"
                        className="size-full"
                        allow="autoplay"
                      />
                    </div>
                  ) : (
                    <div className="flex h-[380px] w-[300px] items-center justify-center text-center text-(--obs-text-muted)">
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
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap justify-around">
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
