import { FaCalendar, FaEnvelope, FaGraduationCap, FaUser } from "react-icons/fa";
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

  return (
    <Page>
      <Section className="flex-row flex-wrap items-center justify-center">
        <Avatar />
        <form
          className="flex-1 min-h-68 px-8 py-6 rounded-2xl bg-base-300 flex flex-col gap-4"
          onSubmit={handleUpdateProfile}
        >
          <div className="w-full flex flex-wrap gap-8">
            <Input
              required
              label="Full Name"
              type="text"
              error={errors.toLowerCase().includes("name")}
              icon={<FaUser className="mr-2" />}
              value={data?.full_name}
              setValue={(value: string) => setData({ ...data, full_name: value })}
              className="flex-1 w-full"
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
          <div className="w-full flex flex-wrap gap-8">
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
          <div className="w-full flex flex-wrap gap-8">
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
