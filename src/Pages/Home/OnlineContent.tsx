import BrowserCard from "../../Components/BrowserCard";
import Button from "../../Components/Button"
import Section from "../../Components/Section"
import onlineContent from "../../Assets/Data/onlineContent.json"

const OnlineContent = () => {
  return (
    <Section title="Online Content">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {onlineContent.map((content, index) => (
          <BrowserCard
            key={content.title}
            image={content.image}
            title={content.title}
            description={content.description}
            link={content.link}
            delay={index * 0.1}
            linkText="Read More"
          />
        ))}
      </div>
      <Button onClick={() => {
        window.open("https://medium.com/ds3ucsd", "_blank");
      }}>View All</Button>
    </Section>
  )
}

export default OnlineContent
