// C:\Users\dmath\OneDrive\Desktop\Proper Main Site\main-site\main-site\src\Components\ConsultingProjects.tsx

import React from "react";
import consultingProjects from "src/Assets/Data/consulting-projects.json";

export default function ConsultingProjects() {
  const projects2024 = consultingProjects.projects["2024"];

  return (
    <section className="w-full py-16 px-6 bg-[#05050b]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h2 className="text-3xl font-bold text-white mb-2">{consultingProjects.about.name}</h2>
        <p className="text-gray-400 mb-8">
          Build real products with DS3 through our external consulting work.
        </p>

        {/* Cards grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects2024.map((project: any, idx: number) => (
            <div
              key={idx}
              className="
                relative flex flex-col
                bg-[#101018]
                border border-[#26263a]
                rounded-2xl
                shadow-[0_18px_40px_rgba(0,0,0,0.55)]
                p-6
                transition-all duration-150
                hover:-translate-y-1
                hover:shadow-[0_24px_50px_rgba(0,0,0,0.65)]
              "
            >
              {/* Top image / icon */}
              <div className="flex justify-center mb-4">
                <img
                  src={project.card.image}
                  alt={project.card.title}
                  className="h-14 w-14 object-contain"
                />
              </div>

              {/* Title */}
              <h3 className="text-base font-semibold text-white text-center mb-2">
                {project.card.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-300 text-center mb-5">{project.card.description}</p>

              {/* Clients */}
              <div className="flex justify-center gap-3 mb-4">
                {project.card.clients.map((client: any, cIdx: number) => (
                  <div key={cIdx} className="flex flex-col items-center gap-1">
                    <img
                      src={client.image}
                      alt={client.name}
                      className="h-7 w-7 object-contain rounded"
                    />
                    <span className="text-[11px] text-gray-400">{client.name}</span>
                  </div>
                ))}
              </div>

              {/* Tag pill */}
              <div className="mt-auto flex justify-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#181824] px-3 py-1">
                  <span className="h-2 w-2 rounded-full bg-orange-400" />
                  <span className="text-[11px] font-medium text-gray-200">Data Analytics</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
