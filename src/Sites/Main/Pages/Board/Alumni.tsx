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
      <div
        style={{
          width: "100%",
          maxWidth: 1300,
          margin: "0 auto",
          padding: "clamp(5rem, 9vw, 9rem) clamp(1.25rem, 4vw, 3rem) clamp(3rem, 5vw, 5rem)",
          display: "flex",
          flexDirection: "column",
          gap: "clamp(2rem, 4vw, 3.5rem)",
        }}
      >
        {/* Hero header */}
        <div style={{ borderBottom: "1px solid var(--obs-border, rgba(128,128,128,0.2))", paddingBottom: "clamp(1.5rem, 3vw, 3rem)" }}>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}
          >
            <div style={{ width: 22, height: 2, background: "#F58134", borderRadius: 2 }} />
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#F58134",
            }}>
              Where are they now
            </span>
          </motion.div>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem" }}>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(3rem, 7vw, 6rem)",
                fontWeight: 400,
                lineHeight: 0.95,
                color: "var(--obs-text-primary)",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Alumni
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                fontSize: "clamp(0.85rem, 1.1vw, 1rem)",
                color: "var(--obs-text-primary)",
                opacity: 0.55,
                margin: 0,
                maxWidth: 420,
                lineHeight: 1.7,
                textAlign: "right",
              }}
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
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}
        >
          {/* Result count */}
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--obs-text-primary)",
            opacity: 0.4,
          }}>
            {alumni.length} {alumni.length === 1 ? "member" : "members"}
          </span>

          {/* Search input */}
          <div style={{ position: "relative" }}>
            <SearchMagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--obs-text-primary)] opacity-[0.35]" />
            <input
              type="text"
              placeholder="Search alumni..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                letterSpacing: "0.1em",
                padding: "0.5rem 1rem 0.5rem 2.25rem",
                background: "transparent",
                border: "1px solid var(--obs-border, rgba(128,128,128,0.25))",
                borderRadius: "2rem",
                color: "var(--obs-text-primary)",
                outline: "none",
                width: "clamp(180px, 20vw, 260px)",
                transition: "border-color 0.2s ease",
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "#F58134")}
              onBlur={e => (e.currentTarget.style.borderColor = "var(--obs-border, rgba(128,128,128,0.25))")}
            />
          </div>
        </motion.div>

        {/* Grid */}
        {pageAlumni.length > 0 ? (
          <>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "clamp(1rem, 2vw, 1.5rem)",
            }}>
              {pageAlumni.map((member, index) => (
                <Suspense key={`${page}-${index}`} fallback={<div style={{ aspectRatio: "1" }} />}>
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
              <div style={{ marginTop: "0.5rem" }}>
                <Paginate numPages={numPages} page={page} setPage={setPage} />
              </div>
            )}
          </>
        ) : (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.6rem",
            padding: "4rem 2rem",
            border: "1px dashed var(--obs-border, rgba(128,128,128,0.2))",
            borderRadius: "0.75rem",
          }}>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.62rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#F58134",
            }}>No results</span>
            <p style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.2rem, 2vw, 1.6rem)",
              fontWeight: 400,
              color: "var(--obs-text-primary)",
              opacity: 0.5,
              margin: 0,
            }}>
              No alumni found for "{search}"
            </p>
          </div>
        )}
      </div>
    </Page>
  );
};

export default Alumni;