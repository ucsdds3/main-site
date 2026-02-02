import Button from "src/Shared/Components/Button";
import Section from "src/Shared/Page/Section";

import BrowserCard from "../Components/BrowserCard";
import onlineContent from "../Data/onlineContent.json";

const OnlineContent = () => {
  return (
    <Section title="Online Content" className="gap-0">
      <p className="text-2xl font-light max-w-xl text-center px-10">
        Have something to share or want to explore more? Read our latest articles or submit your own
        for publication!
      </p>
      <div className="grid text-center grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-10">
        {onlineContent.map((content, index) => (
          <BrowserCard
            key={content.title}
            image={content.image}
            title={content.title}
            description= " "
            link={content.link}
            delay={index * 0.1}
            linkText="Read"
          />
        ))}
      </div>
      <Button
        onClick={() => {
          window.open("https://medium.com/ds3ucsd", "_blank");
        }}
      >
        View All
      </Button>
    </Section>
  );
};

export default OnlineContent;
