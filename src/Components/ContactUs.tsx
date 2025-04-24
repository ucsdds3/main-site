import dino from "/src/Assets/Images/dino.png";
import Section from "./Section";
import Button from "./Button";
import Star from "./Star";

const ContactUs = () => {
  return (
    <Section className="lg:flex-row pt-[10rem] px-[clamp(0.5rem,2vw,2.5rem)] gap-[clamp(6rem,8vw,10rem)]">      
      <div className="flex-1 flex flex-col justify-center items-center text-center lg:text-left px-[clamp(1rem,3vw,5rem)] relative">
        <Star size={2} className="absolute top-4 right-10" />
        <Star size={2} className="absolute -bottom-1/8 lg:top-7/16 left-1/8" />
        <Star size={3} className="absolute -bottom-1/4 lg:top-1/2 left-1/5" />

        <div className="w-full flex flex-col">
          <h3 className="text-[clamp(1rem,2.5vw,1.5rem)] lg:text-[clamp(1rem,1.7vw,1.5rem)] font-semibold uppercase">Want to Learn More?</h3>
          <h2 className="text-[clamp(2.2rem,8vw,4rem)] lg:text-[clamp(2.2rem,4vw,4rem)] font-semibold uppercase">Contact Us</h2>
          <p className="text-[clamp(1rem,1.2vw,1.2rem)] font-light max-w-[clamp(20rem,50vw,40rem)]">
            Get in touch with us regarding blah blah we are so cool you will love being in our club,
            i think by the time you are here you would get a direct offer from amazon.
          </p>
        </div>
        <img
          src={dino}
          className="hidden lg:block w-[clamp(25rem,32vw,40rem)] p-[clamp(2rem,3vw,5rem)] -rotate-15 scale-x-[-1]"
        />
      </div>

      <form className="flex-1 w-[clamp(300px,70vw,400px)] flex flex-col gap-6">
        {["Name", "Email", "Subject"].map((label) => (
          <label className="flex flex-col gap-2">
            <span className="text-lg font-semibold">{label}</span>
            <input
              type="text"
              required
              placeholder={label}
              className="input input-primary input-lg w-full"
            />
          </label>
        ))}
        <label className="flex flex-col gap-2">
          <span className="text-lg font-semibold">Message</span>
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
