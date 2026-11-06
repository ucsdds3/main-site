import { useMemo, useState } from "react";
import { FaListUl, FaMagic, FaMoon, FaUser } from "react-icons/fa";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import Page from "src/Shared/Page/Page";
import Section from "src/Shared/Page/Section";
import Button from "src/Shared/Components/Button";
import { useAuthStore } from "src/Sites/Members/Hooks/useAuthStore";

import Select from "../../Components/Select";
import { FileInput } from "../../Components/FileInput";
import { TextArea } from "../../Components/Input";

type OvernightChoice = "" | "Yes" | "No" | "Maybe";
type VibeChoice = "" | "Yes" | "No" | "Maybe";

type ResumeMode = "upload" | "existing";

function parseSkillLines(raw: string): string[] {
  const parts = raw
    .split(/[\n,]+/)
    .map(s => s.trim())
    .filter(Boolean);
  return [...new Set(parts)];
}

const HackathonMatching = () => {
  const { user } = useAuthStore();
  const resumeOnProfile = useMemo(() => {
    const link = user?.user_metadata?.resume_link;
    return typeof link === "string" && link.trim().length > 0 ? link.trim() : null;
  }, [user?.user_metadata?.resume_link]);

  const [skillsRaw, setSkillsRaw] = useState("");
  const [overnight, setOvernight] = useState<OvernightChoice>("");
  const [vibeCoding, setVibeCoding] = useState<VibeChoice>("");
  const [resumeMode, setResumeMode] = useState<ResumeMode>("upload");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [submittedSummary, setSubmittedSummary] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const skills = parseSkillLines(skillsRaw);
    if (skills.length === 0) {
      toast.error("Add at least one skill you want in a teammate.");
      return;
    }
    if (!overnight) {
      toast.error('Select an answer for "stay up the whole night".');
      return;
    }
    if (!vibeCoding) {
      toast.error('Select an answer for "vibecoding everything".');
      return;
    }
    if (resumeMode === "upload" && !resumeFile) {
      toast.error("Choose a PDF to upload, or switch to reusing your profile resume.");
      return;
    }
    if (resumeMode === "existing" && !resumeOnProfile) {
      toast.error("No resume on file. Add a resume link on your profile or upload a PDF here.");
      return;
    }

    const fileNote =
      resumeMode === "upload" && resumeFile
        ? `${resumeFile.name} (${Math.round(resumeFile.size / 1024)} KB)`
        : "Profile resume link (not uploaded in this preview)";

    const summary = [
      "Saved locally (API not wired yet):",
      "",
      `Skills wanted (${skills.length}): ${skills.join(", ")}`,
      `Stay up all night: ${overnight}`,
      `Open to vibecoding everything: ${vibeCoding}`,
      `Resume: ${fileNote}`,
    ].join("\n");

    setSubmittedSummary(summary);
    toast.success("Form looks good — summary below. Backend hookup comes next.");
  };

  return (
    <Page>
      <Section className="flex-col items-stretch justify-center gap-8 max-w-3xl w-full mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="obs-eyebrow-row mb-0"
        >
          <div className="obs-accent-bar-cyan shrink-0" />
          <span className="text-eyebrow text-eyebrow-cyan">DataHacks</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="text-fluid-subsection-title text-balance"
        >
          Teammate matching
        </motion.h1>

        <p className="text-base text-(--obs-text-muted) max-w-2xl">
          Tell us what you&apos;re looking for and how you like to work. This page is a{" "}
          <span className="text-(--obs-text-primary)">preview UI</span> — nothing is sent to a
          server yet.
        </p>

        <form className="flex flex-col gap-8 w-full" onSubmit={handleSubmit}>
          <div className="obs-panel flex flex-col gap-4 px-6 py-6 w-full">
            <h2 className="text-lg font-semibold text-(--obs-text-primary) flex items-center gap-2">
              <FaListUl className="text-[#19B5CA]" aria-hidden />
              Skills you want in a teammate
            </h2>
            <TextArea
              label="List skills"
              required
              fieldId="hackathon-skills"
              placeholder="e.g. React, PyTorch, data viz — one per line or comma-separated"
              rows={5}
              className="w-full min-w-0 max-w-none"
              value={skillsRaw}
              setValue={setSkillsRaw}
            />
          </div>

          <div className="obs-panel flex flex-col gap-4 px-6 py-6 w-full">
            <h2 className="text-lg font-semibold text-(--obs-text-primary) flex items-center gap-2">
              <FaUser className="text-[#19B5CA]" aria-hidden />
              Resume
            </h2>
            <p className="text-sm text-(--obs-text-muted)">
              Upload a PDF for this flow, or reuse the resume link already on your member profile.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-(--obs-text-primary)">
                <input
                  type="radio"
                  name="resume-mode"
                  className="radio radio-primary"
                  checked={resumeMode === "upload"}
                  onChange={() => {
                    setResumeMode("upload");
                  }}
                />
                Upload PDF
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-(--obs-text-primary)">
                <input
                  type="radio"
                  name="resume-mode"
                  className="radio radio-primary"
                  checked={resumeMode === "existing"}
                  onChange={() => setResumeMode("existing")}
                />
                Use profile resume
              </label>
            </div>

            {resumeMode === "upload" ? (
              <FileInput
                label="Resume file"
                accept="application/pdf,.pdf"
                onChange={e => {
                  const f = e.target.files?.[0] ?? null;
                  setResumeFile(f);
                }}
              />
            ) : (
              <div className="rounded-lg border border-(--obs-border-mid) bg-(--obs-surface) px-4 py-3 text-sm text-(--obs-text-muted)">
                {resumeOnProfile ? (
                  <>
                    <span className="text-(--obs-text-primary) font-medium">Profile resume: </span>
                    <a
                      href={resumeOnProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="obs-link underline break-all"
                    >
                      {resumeOnProfile}
                    </a>
                  </>
                ) : (
                  <>No resume link on your profile yet. Add one under Profile or upload a PDF here.</>
                )}
              </div>
            )}
          </div>

          <div className="obs-panel flex flex-col gap-6 px-6 py-6 w-full">
            <h2 className="text-lg font-semibold text-(--obs-text-primary)">Working style</h2>
            <div className="flex flex-col md:flex-row flex-wrap gap-6">
              <Select
                label="Stay up the whole night?"
                required
                fieldId="hackathon-overnight"
                showPlaceholderOption
                icon={<FaMoon className="mr-2 shrink-0 text-(--obs-text-muted)" />}
                options={["Yes", "No", "Maybe"]}
                value={overnight}
                setValue={v => setOvernight(v as OvernightChoice)}
                className="min-w-0 w-full md:flex-1 md:max-w-md"
              />
              <Select
                label="Open to vibecoding everything?"
                required
                fieldId="hackathon-vibe"
                showPlaceholderOption
                icon={<FaMagic className="mr-2 shrink-0 text-(--obs-text-muted)" />}
                options={["Yes", "No", "Maybe"]}
                value={vibeCoding}
                setValue={v => setVibeCoding(v as VibeChoice)}
                className="min-w-0 w-full md:flex-1 md:max-w-md"
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button type="submit">Save (local preview)</Button>
          </div>
        </form>

        {submittedSummary && (
          <div className="obs-panel w-full px-6 py-6" role="status" aria-live="polite">
            <h2 className="text-lg font-semibold text-(--obs-text-primary) mb-3">Last submission</h2>
            <pre className="whitespace-pre-wrap text-sm text-(--obs-text-muted) font-mono">
              {submittedSummary}
            </pre>
          </div>
        )}
      </Section>
    </Page>
  );
};

export default HackathonMatching;
