import dino from "/src/Assets/Images/dino.webp";
import Section from "./Section";
import Button from "./Button";
import Star from "./Star";

type ContactUsProps = {
  ref?: React.RefObject<HTMLDivElement>;
  type?: "partners" | "students";
};

const ContactUs = ({ ref, type = "students" }: ContactUsProps) => {
  const greeting = "Want to Learn More?";
  const description = type === "partners" 
    ? "We're always excited to connect with industry partners. Whether you're looking to collaborate on real-world projects, host technical workshops, or support data-driven education, we'd love to hear from you."
    : "Have questions about joining DS3? Curious about our projects, workshops, or how to get more involved on campus? Whether you're new to data science or looking to deepen your experience, we’re here to help.";

  return (
    <Section
      className="lg:flex-row pt-[10rem] px-[clamp(0.5rem,2vw,2.5rem)] gap-[clamp(6rem,8vw,10rem)]"
      id="contact"
      ref={ref}
    >
      <div className="flex-1 flex flex-col justify-center items-center text-center lg:text-left px-[clamp(1rem,3vw,5rem)] relative">
        <Star size={2} className="absolute top-4 right-10" />
        <Star size={2} className="absolute -bottom-1/8 lg:top-7/16 left-1/8" />
        <Star size={3} className="absolute -bottom-1/4 lg:top-1/2 left-1/5" />

        <div className="w-full flex flex-col">
          <h3 className="text-[clamp(1rem,2.5vw,1.5rem)] lg:text-[clamp(1rem,1.7vw,1.5rem)] font-semibold uppercase">
            {greeting}
          </h3>
          <h2 className="text-[clamp(2.2rem,8vw,4rem)] lg:text-[clamp(2.2rem,4vw,4rem)] font-semibold uppercase">
            Contact Us
          </h2>
          <p className="text-[clamp(1.4rem,1.2vw,1.5rem)] font-light max-w-[clamp(20rem,50vw,40rem)]">
            {description}
          </p>
        </div>
        <img
          src={dino}
          className="hidden lg:block w-[clamp(25rem,32vw,40rem)] p-[clamp(2rem,3vw,5rem)] -rotate-15 scale-x-[-1]"
        />
      </div>

      <form className="flex-1 w-[clamp(300px,70vw,400px)] flex flex-col gap-6">
        {["Name", "Email", "Subject"].map((label, index) => (
          <label className="flex flex-col gap-2" key={index}>
            <span className="text-2xl font-semibold">{label}</span>
            <input
              type="text"
              required
              placeholder={label}
              className="input input-primary input-lg w-full"
            />
          </label>
        ))}
        <label className="flex flex-col gap-2">
          <span className="text-2xl font-semibold">Message</span>
          <textarea
            required
            placeholder="Message"
            className="textarea textarea-primary textarea-lg w-full h-[8rem]"
          />
        </label>
        <Button onClick={() => {}}>SUBMIT</Button>
      </form>
    </Section>
  );
};

export default ContactUs;
