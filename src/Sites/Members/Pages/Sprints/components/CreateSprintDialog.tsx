import { useState } from "react";
import { TfiClose } from "react-icons/tfi";
import toast from "react-hot-toast";

import { Input } from "src/Sites/Members/Components/Input";
import Button from "src/Shared/Components/Button";

type CreateSprintDialogProps = {
  onClose: () => void;
  onCreate: (input: { name: string; starts_on: string; ends_on: string }) => Promise<void>;
};

export default function CreateSprintDialog({ onClose, onCreate }: CreateSprintDialogProps) {
  const [name, setName] = useState("");
  const [startsOn, setStartsOn] = useState("");
  const [endsOn, setEndsOn] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !startsOn || !endsOn) {
      toast.error("Name and dates are required.");
      return;
    }
    if (endsOn < startsOn) {
      toast.error("End date must be on or after the start date.");
      return;
    }

    setSaving(true);
    try {
      await onCreate({ name: name.trim(), starts_on: startsOn, ends_on: endsOn });
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create sprint");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md rounded-2xl border border-(--obs-border) bg-[#080e19] p-6"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 cursor-pointer border-0 bg-transparent text-(--obs-text-muted)"
          aria-label="Close"
        >
          <TfiClose />
        </button>
        <p className="text-eyebrow text-eyebrow-orange">Executive</p>
        <h2 className="mt-2 font-heading text-2xl text-(--obs-text-primary)">Create sprint</h2>
        <p className="mt-2 text-sm text-(--obs-text-muted)">
          One club-wide sprint. If none is active, this one starts immediately.
        </p>

        <div className="mt-5 flex flex-col gap-4">
          <Input
            label="Name"
            required
            className="w-full min-w-0"
            value={name}
            setValue={setName}
            placeholder="Week 2 — Spring"
          />
          <Input
            label="Starts"
            required
            type="date"
            className="w-full min-w-0"
            value={startsOn}
            setValue={setStartsOn}
          />
          <Input
            label="Ends"
            required
            type="date"
            className="w-full min-w-0"
            value={endsOn}
            setValue={setEndsOn}
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full border border-(--obs-border) bg-transparent px-5 py-2 font-mono text-[0.7rem] uppercase tracking-widest text-(--obs-text-muted)"
          >
            Cancel
          </button>
          <Button type="submit" disabled={saving} className="my-0">
            {saving ? "Creating…" : "Create sprint"}
          </Button>
        </div>
      </form>
    </div>
  );
}
