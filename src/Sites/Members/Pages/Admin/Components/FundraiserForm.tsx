import { useState } from "react";
import toast from "react-hot-toast";

import { Input } from "src/Sites/Members/Components/Input";
import Button from "src/Shared/Components/Button";

type FundraiserFormProps = {
  onAdd: (input: { held_on: string; place: string; amount: number }) => Promise<void>;
};

export default function FundraiserForm({ onAdd }: FundraiserFormProps) {
  const [heldOn, setHeldOn] = useState("");
  const [place, setPlace] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(heldOn)) {
      toast.error("Date is required.");
      return;
    }
    if (!place.trim()) {
      toast.error("Place is required.");
      return;
    }
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Amount must be greater than 0.");
      return;
    }

    setSaving(true);
    try {
      await onAdd({ held_on: heldOn, place: place.trim(), amount: value });
      setPlace("");
      setAmount("");
      toast.success("Fundraiser added.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add fundraiser");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="obs-panel flex flex-col gap-4 p-6">
      <p className="m-0 font-mono text-[0.68rem] uppercase tracking-widest text-[#19B5CA]">
        Add a fundraiser
      </p>
      <div className="flex flex-wrap gap-4">
        <Input
          label="Date"
          required
          type="date"
          className="w-full min-w-0 sm:w-44"
          value={heldOn}
          setValue={setHeldOn}
        />
        <Input
          label="Place"
          required
          maxLength={80}
          className="w-full min-w-0 flex-1"
          value={place}
          setValue={setPlace}
          placeholder="Chipotle"
        />
        <Input
          label="Amount"
          required
          type="number"
          min="0.01"
          step="0.01"
          className="w-full min-w-0 sm:w-40"
          value={amount}
          setValue={setAmount}
          placeholder="0.00"
        />
      </div>
      <div>
        <Button type="submit" disabled={saving} className="my-0">
          {saving ? "Adding…" : "Add result"}
        </Button>
      </div>
    </form>
  );
}
