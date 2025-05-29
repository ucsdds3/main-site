import Star from "../../Components/Star";
import Section from "../../Components/Section";
import Page from "../Page/Page";
import { Suspense, useState, useEffect } from "react";
import HoverCard from "../../Components/HoverCard";
import { formatMemberLinks, newArray } from "../../Utils/functions";
import alumniData from "../../Assets/Data/members.json";
import { MemberType } from "../../Utils/types";

const Alumni = () => {
  const [search, setSearch] = useState("");
  const [alumni, setAlumni] = useState(alumniData);

  const cardsPerPage = 12;
  const [page, setPage] = useState(1);
  const endPage = page * cardsPerPage;
  const startPage = (page - 1) * cardsPerPage;
  const [numPages, setNumPages] = useState(alumni.length / cardsPerPage);

  useEffect(() => {
    setPage(1);
    const filteredAlumni = alumniData.filter((member) => member.name.toLowerCase().includes(search.toLowerCase()));
    setAlumni(filteredAlumni);
    setNumPages(Math.ceil(filteredAlumni.length / cardsPerPage));
  }, [search]);

  return (
    <Page>
      <Section title="Alumni" className="gap-0 relative">
        <p className="text-2xl font-light max-w-2xl text-center px-10">
          Our alumni are a vital part of our community. They are a source of inspiration and
          motivation for our current members.
        </p>
        
        <Star size={2.5} className="absolute top-10 right-14" />
        <Star size={2} className="absolute top-6 right-6" />
        <Star size={2} className="absolute bottom-10 left-6" />
        <Star size={2.5} className="absolute bottom-6 left-14" />
      </Section>

      <Section>
        <div className="flex justify-center md:justify-end w-full">
          <input
            type="text"
            placeholder="Search"
            className="input input-bordered w-full max-w-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="w-full grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-y-8 py-12">
          {alumni.slice(startPage, endPage).map((member, index) => (
            <Suspense fallback={<div className="w-full" />}>
              <HoverCard
                key={index}
                title={member.name}
                description={member.role}
                image={member.image}
                size="240px"
                links={formatMemberLinks(member as MemberType)}
              />
            </Suspense>
          ))}
        </div>

        <div className="join">
          {newArray(numPages).map((_, index) => (
            <button
              key={index}
              className="join-item btn data-[active=true]:btn-active"
              onClick={() => setPage(index + 1)}
              data-active={page == index + 1}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </Section>
    </Page>
  );
};

export default Alumni;
