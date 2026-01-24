import { useEffect, useState } from "react";
import { Input, TextArea } from "../../Components/Input";
import { Card } from "./Admin";
import DashboardButton from "./DashboardButton";
import DashboardSectionHeader from "./DashboardSectionHeader";
import { supabase } from "src/Utils/supabase";
import toast from "react-hot-toast";
import { EventType } from "src/Utils/types";

const initialForm = {
  Attendance: [{ count: 0 }],
  name: "",
  points: 0,
  start: "",
  end: "",
  password: "",
  description: "",
  tags: [],
  location: "",
};

export default function DashboardEvents() {
  const [imageUrl, setImageUrl] = useState("");
  const [formData, setFormData] = useState(initialForm);
  const [events, setEvents] = useState<
    (EventType & { Attendance: { count: number }[]; id: number })[]
  >([]);

  const handleChange = (name: string, value: string) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };
  const submitForm = async () => {
    console.log(formData);
    const { error } = await supabase.from("Events").insert({
      name: formData.name,
      description: formData.description,
      points: formData.points,
      image: imageUrl,
      password: formData.password,
      start: formData.start,
      end: formData.end,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Event successfully added");
      fetchEvents();
    }
  };
  const resetForm = () => {
    setFormData(initialForm);
    setImageUrl("");
  };
  const archiveEvent = async (id: number) => {
    const { error } = await supabase.from("Events").update({ deleted: true }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Event successfully archived");
      fetchEvents();
    }
  };

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("Events")
      .select("id,name, description,image,points,Attendance (count),start,end ")
      .eq("deleted", false)
      .order("start", { ascending: false });
    if (error) toast.error(error.message);
    else {
      setEvents(data);
    }
  };
  useEffect(() => {
    // const now = new Date().toISOString();
    fetchEvents();
    console.log("fetching events");
  }, []);

  return (
    <section className="lg:col-span-6">
      <Card>
        <DashboardSectionHeader
          title="Events"
          subtitle="Create, publish, and archive events (UI-only)."
        />

        <form
          className="grid gap-3 md:grid-cols-2"
          onSubmit={e => {
            e.preventDefault();
            submitForm();
          }}
        >
          <Input
            label="Event name"
            className="w-full min-w-0"
            required
            value={formData.name}
            setValue={value => handleChange("name", value)}
          />
          <Input
            label="Points"
            type="number"
            className="w-full min-w-0"
            required
            value={String(formData.points)}
            setValue={value => handleChange("points", value)}
          />
          <Input
            label="Start date"
            className="w-full min-w-0"
            type="datetime-local"
            value={formData.start}
            setValue={value => handleChange("startDate", value)}
            required
          />
          <Input
            label="End date"
            className="w-full min-w-0"
            type="datetime-local"
            value={formData.end}
            setValue={value => handleChange("end", value)}
            required
          />
          <Input
            label="Password"
            className="w-full min-w-0"
            required
            value={formData.password}
            setValue={value => handleChange("password", value)}
          />

          <TextArea
            label="Description"
            className="w-full col-span-2"
            required
            value={formData.description}
            setValue={value => handleChange("description", value)}
          />

          <Input
            required
            label="Event image URL"
            placeholder="https://example.com/image.jpg"
            className="w-full col-span-2"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
          />

          {imageUrl && (
            <div className="col-span-2">
              <div className="text-xs text-white/60 mb-1">Image preview</div>
              <img
                src={imageUrl}
                alt="Event preview"
                // onError={e => (e.currentTarget.style.display = "none")}
                className="max-h-48 w-full rounded-xl border border-white/10 object-cover"
              />
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <DashboardButton variant="orange" type="submit">
              Publish
            </DashboardButton>
            <DashboardButton
              type="reset"
              variant="ghost"
              onClick={e => {
                e.preventDefault();
                resetForm();
              }}
            >
              Reset
            </DashboardButton>
          </div>
        </form>

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/60">
              <tr>
                <th className="px-4 py-3">Upcoming Event</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Check-ins</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {events.map((event, i) => (
                <tr key={i} className="hover:bg-white/5">
                  <td className="px-4 py-3">
                    <div className="font-medium">{event.name}</div>
                  </td>
                  <td className="px-4 py-3">{event.start?.split("T")[0]}</td>

                  <td className="px-4 py-3">{event.Attendance[0].count}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <DashboardButton variant="ghost" onClick={() => archiveEvent(event.id)}>
                        Archive
                      </DashboardButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}
