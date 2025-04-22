import Section from "./Section";

const FAQ = ({ faq }: { faq: Record<string, string> }) => {
  return (
    <Section title="Frequently Asked Questions">
      <div className="join join-vertical bg-base-100 w-[80%]">
        {Object.entries(faq).map(([question, answer], index) => (
          <div className="collapse collapse-arrow join-item border-base-300 border" key={index}>
            <input type="checkbox" />
            <div className="collapse-title font-semibold">{question}</div>
            <div className="collapse-content">{answer}</div>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default FAQ;
