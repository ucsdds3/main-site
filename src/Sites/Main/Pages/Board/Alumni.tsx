import { Suspense, useState, useEffect } from "react";
import { motion } from "framer-motion";

import Page from "src/Shared/Page/Page";
import { SearchMagnifyingGlassIcon } from "src/Shared/icons/SearchMagnifyingGlassIcon";
import HoverCard from "src/Shared/Components/HoverCard";
import Paginate from "src/Shared/Components/Paginate";
import { unbreakable } from "src/Utils/functions";

import alumniData from "./Data/alumni.json";

const PER_PAGE = 12;

const Alumni = () => {
  const [search, setSearch] = useState("");
  const [alumni, setAlumni] = useState(alumniData);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
    const filtered = alumniData.filter(m =>
      m.name.toLowerCase().includes(search.toLowerCase())
    );
    setAlumni(filtered);
  }, [search]);

  const numPages = Math.ceil(alumni.length / PER_PAGE);
  const start = (page - 1) * PER_PAGE;
  const pageAlumni = alumni.slice(start, start + PER_PAGE);

  return (
    <Page>
      <div className="mx-auto flex w-full max-w-[1300px] flex-col gap-[clamp(2rem,4vw,3.5rem)] px-[clamp(1.25rem,4vw,3rem)] pb-[clamp(3rem,5vw,5rem)] pt-[clamp(5rem,9vw,9rem)]">
        {/* Hero header */}
        <div className="obs-section-header-border-loose">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="obs-eyebrow-row"
          >
            <div className="obs-accent-bar-orange" />
            <span className="text-eyebrow text-eyebrow-orange">Where are they now</span>
          </motion.div>

          <div className="flex flex-wrap items-end justify-between gap-6">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="m-0 font-heading text-[clamp(3rem,7vw,6rem)] font-normal leading-[0.95] tracking-tight text-(--obs-text-primary)"
            >
              Alumni
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="m-0 max-w-[420px] text-right text-[clamp(0.85rem,1.1vw,1rem)] leading-[1.7] text-(--obs-text-primary) opacity-[0.55]"
            >
              Our alumni are a vital part of our community — a source of inspiration and motivation for our current members.
            </motion.p>
          </div>
        </div>

        {/* Search + count row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          {/* Result count */}
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-(--obs-text-primary) opacity-[0.4]">
            {alumni.length} {alumni.length === 1 ? "member" : "members"}
          </span>

          {/* Search input */}
          <div className="relative">
            <SearchMagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--obs-text-primary) opacity-[0.35]" />
            <input
              type="text"
              placeholder="Search alumni..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-[clamp(180px,20vw,260px)] rounded-[2rem] border border-(--obs-border) bg-transparent py-2 pl-9 pr-4 font-mono text-[0.72rem] tracking-[0.1em] text-(--obs-text-primary) outline-none transition-[border-color] duration-200 focus:border-[#F58134]"
            />
          </div>
        </motion.div>

        {/* Grid */}
        {pageAlumni.length > 0 ? (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-[clamp(1rem,2vw,1.5rem)]">
              {pageAlumni.map((member, index) => (
                <Suspense key={`${page}-${index}`} fallback={<div className="aspect-square" />}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <HoverCard
                      title={member.name}
                      description={`${member.role} ${unbreakable(member.year)}`}
                      image={member.image}
                      size="180px"
                    />
                  </motion.div>
                </Suspense>
              ))}
            </div>

            {numPages > 1 && (
              <div className="mt-2">
                <Paginate numPages={numPages} page={page} setPage={setPage} />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-[0.6rem] rounded-xl border border-dashed border-(--obs-border) px-8 py-16">
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[#F58134]">No results</span>
            <p className="m-0 font-heading text-[clamp(1.2rem,2vw,1.6rem)] font-normal text-(--obs-text-primary) opacity-50">
              No alumni found for "{search}"
            </p>
          </div>
        )}
      </div>
    </Page>
  );
};

export default Alumni;
