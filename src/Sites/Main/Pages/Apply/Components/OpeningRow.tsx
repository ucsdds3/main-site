import { IoIosArrowForward } from "react-icons/io";

import SafeLink from "src/Shared/Components/SafeLink";

import type { ApplicationOpening } from "../types";

function parsePosterEmails(raw: string): string[] {
  return raw
    .split(/[,;\s]+/)
    .map(part => part.trim())
    .filter(part => part.includes("@"));
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function OpeningRow({ opening }: { opening: ApplicationOpening }) {
  const emails = parsePosterEmails(opening.poster_emails);
  const preferred = opening.preferred_experience?.trim() ?? "";

  return (
    <li className="obs-panel px-5 py-4">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-5">
            <h3 className="m-0 min-w-0 flex-1 text-base font-semibold text-(--obs-text-primary) sm:text-lg">
              {opening.title}
            </h3>
            <p className="m-0 shrink-0 font-mono text-[0.68rem] uppercase tracking-widest text-[#19B5CA]">
              Due {formatWhen(opening.due_at)}
            </p>
          </div>

          <details className="group mt-2">
            <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 font-mono text-[0.68rem] uppercase tracking-widest text-(--obs-text-faint) [&::-webkit-details-marker]:hidden">
              <IoIosArrowForward className="size-3.5 shrink-0 transition-transform group-open:rotate-90" />
              Details
            </summary>
            <div className="mt-3 flex flex-col gap-4 border-t border-(--obs-border) pt-3">
              <div>
                <p className="m-0 font-mono text-[0.62rem] uppercase tracking-widest text-(--obs-text-faint)">
                  Description
                </p>
                <p className="mb-0 mt-1 whitespace-pre-wrap text-sm leading-6 text-(--obs-text-muted)">
                  {opening.description}
                </p>
              </div>
              {preferred ? (
                <div>
                  <p className="m-0 font-mono text-[0.62rem] uppercase tracking-widest text-(--obs-text-faint)">
                    Preferred experience / qualities
                  </p>
                  <p className="mb-0 mt-1 whitespace-pre-wrap text-sm leading-6 text-(--obs-text-muted)">
                    {preferred}
                  </p>
                </div>
              ) : null}
              {emails.length > 0 ? (
                <div>
                  <p className="m-0 font-mono text-[0.62rem] uppercase tracking-widest text-(--obs-text-faint)">
                    Contact
                  </p>
                  <p className="mb-0 mt-1 text-sm text-(--obs-text-muted)">
                    {emails.map((email, idx) => (
                      <span key={email}>
                        {idx > 0 ? ", " : null}
                        <a className="text-[#19B5CA]" href={`mailto:${email}`}>
                          {email}
                        </a>
                      </span>
                    ))}
                  </p>
                </div>
              ) : null}
            </div>
          </details>
        </div>

        <SafeLink
          href={opening.application_url}
          className="mt-0.5 inline-flex shrink-0 no-underline hover:no-underline"
        >
          <span className="rounded-full bg-gradient-to-br from-[#19B5CA] to-[#0e8fa0] px-5 py-2 font-mono text-[0.7rem] font-semibold uppercase tracking-widest text-white">
            Apply
          </span>
        </SafeLink>
      </div>
    </li>
  );
}
