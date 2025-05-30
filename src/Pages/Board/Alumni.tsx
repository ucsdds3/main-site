import Star from "../../Components/Star";
import Section from "../../Components/Section";
import Page from "../Page/Page";
import { Suspense, useState, useEffect } from "react";
import HoverCard from "../../Components/HoverCard";
import { unbreakable } from "../../Utils/functions";
import alumniData from "../../Assets/Data/alumni.json";
import Paginate from "../../Components/Paginate";
import { usePaginate } from "../../Hooks/usePaginate";

const Alumni = () => {
  const [search, setSearch] = useState("");
  const [alumni, setAlumni] = useState(alumniData);

  const { page, setPage, cardsPerPage, numPages, setNumPages, start, end } = usePaginate({
    totalItems: alumniData.length,
    numRows: 3,
  });

  useEffect(() => {
    setPage(1);
    const filteredAlumni = alumniData.filter((member) =>
      member.name.toLowerCase().includes(search.toLowerCase())
    );
    setAlumni(filteredAlumni);
    setNumPages(Math.ceil(filteredAlumni.length / cardsPerPage));
  }, [search, cardsPerPage, setPage, setNumPages]);

  return (
    <Page>
      <Section title="Alumni" className="gap-0 relative">
        <p className="text-2xl font-light max-w-2xl text-center px-10">
          Our alumni are a vital part of our community. They are a source of inspiration and
          motivation for our current members.
        </p>

        <Star size={2.5} className="absolute top-10 right-16" />
        <Star size={2} className="absolute top-6 right-6" />
        <Star size={2} className="absolute bottom-10 left-6" />
        <Star size={2.5} className="absolute bottom-4 left-16" />
      </Section>

      <Section className="gap-0">
        <div className="flex justify-center md:justify-end w-full">
          <input
            type="text"
            placeholder="Search"
            className="input input-lg input-primary w-full max-w-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="w-full grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-y-8 py-12">
          {alumni.slice(start, end).map((member, index) => (
            <Suspense fallback={<div className="w-full" />}>
              <HoverCard
                key={index}
                title={member.name}
                description={`${member.role} ${unbreakable(member.year)}`}
                image={member.image}
                size="240px"
              />
            </Suspense>
          ))}
        </div>

        <Paginate numPages={numPages} page={page} setPage={setPage} />
      </Section>
    </Page>
  );
};

export default Alumni;
