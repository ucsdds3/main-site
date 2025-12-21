import HoverCard from '../../../Components/HoverCard';
import Paginate from '../../../Components/Paginate';
import Section from '../../../Components/Section';
import projectsData from '../../../Assets/Data/projects.json';
import { usePaginate } from '../../../Hooks/usePaginate';
import { useState } from 'react';
import { FaFilePowerpoint, FaGithub, FaGlobe } from 'react-icons/fa';

const ShowCase = () => {
  const projects = projectsData.projects;
  type YearType = keyof typeof projects;
  const years = Object.keys(projects).reverse() as YearType[];
  const [year, setYear] = useState<YearType>(years[0]);
  const [order, setOrder] = useState<'Projects' | 'Presentation'>('Projects');

  const { page, setPage, numPages, start, end } = usePaginate({
    totalItems: projects[year].length,
    numRows: 1,
  });

  const sortedProjects = projects[year].sort((a, b) => {
    if (order === 'Projects') return b.projects_points - a.projects_points;
    return b.presentation_points - a.presentation_points;
  });

  const createLinks = (project: (typeof projects)[YearType][0]) => {
    return [
      {
        title: 'GitHub',
        href: project.github_repository,
        icon: <FaGithub />,
        color: '#11B3C9',
      },
      {
        title: 'Presentation',
        href: project.presentation_slides,
        icon: <FaFilePowerpoint />,
        color: '#F58134',
      },
      {
        title: 'Website',
        href: project.website,
        icon: <FaGlobe />,
        color: '#222222',
      },
    ];
  };

  return (
    <Section>
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center w-full">
        <div className="flex flex-col text-center md:text-left">
          <h2 className="text-5xl font-semibold">PROJECT SHOWCASE</h2>
          <p className="text-2xl">
            {' '}
            Here are some of our latest projects. Hover over a project for relevant links.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <fieldset className="fieldset w-[clamp(10rem,15vw,15rem)] flex flex-col items-center gap-2">
            <span className="text-2xl font-semibold">Order By</span>
            <select
              value={order}
              className="select select-primary select-lg"
              onChange={e => {
                setPage(1);
                setOrder(e.target.value as 'Projects' | 'Presentation');
              }}
            >
              <option value="Projects">Projects Points</option>
              <option value="Presentation">Presentation Points</option>
            </select>
          </fieldset>

          <fieldset className="fieldset w-[clamp(10rem,15vw,15rem)] flex flex-col items-center gap-2">
            <span className="text-2xl font-semibold">Year</span>
            <select
              value={year}
              className="select select-primary select-lg"
              onChange={e => {
                setPage(1);
                setYear(e.target.value as YearType);
              }}
            >
              {years.map((year, index) => (
                <option key={index}>{year}</option>
              ))}
            </select>
          </fieldset>
        </div>
      </div>

      <div className="w-full grid grid-cols-[repeat(auto-fit,minmax(clamp(300px,40vw,350px),1fr))] justify-center gap-y-8">
        {sortedProjects.slice(start, end).map((project, index) => (
          <HoverCard
            key={index}
            {...project}
            placement={page === 1 ? index + 1 : undefined}
            links={createLinks(project)}
            size="clamp(300px, 40vw, 350px)"
            imgClassName="border-2 border-primary"
          />
        ))}
      </div>

      <Paginate numPages={numPages} page={page} setPage={setPage} />
    </Section>
  );
};

export default ShowCase;
