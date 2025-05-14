import Section from "./Section";

const FAQ = ({ faq }: { faq: Record<string, string> }) => {
  return (
    <Section title="FAQ">
      <div className="join join-vertical bg-base-100 w-[80%]">
        {Object.entries(faq).map(([question, answer], index) => (
          <div className="collapse collapse-arrow join-item border" key={index}>
            <input type="checkbox" />
            <div className="collapse-title text-3xl font-semibold">{question}</div>
            <div className="collapse-content text-2xl opacity-90">{answer}</div>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default FAQ;
