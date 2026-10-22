import { createFileRoute, Link } from "@tanstack/react-router";
import teamImg from "@/assets/team.svg";
import salon from "@/assets/salon.svg";
import hands from "@/assets/hands.svg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Studio Demo — A Fictional Hair Studio" },
      {
        name: "description",
        content:
          "The story, philosophy and team behind Studio Demo, a fictional hair studio (demo).",
      },
      { property: "og:title", content: "About Studio Demo — A Fictional Hair Studio" },
      {
        property: "og:description",
        content: "The story and philosophy behind a fictional hair studio.",
      },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  return (
    <div className="pt-32 md:pt-40">
      <section className="mx-auto max-w-[1200px] px-6 md:px-10 text-center animate-fade-up">
        <div className="eyebrow">About</div>
        <h1 className="mt-6 font-serif text-5xl md:text-8xl leading-[1] tracking-[-0.02em]">
          A quiet atelier
          <br />
          <em className="italic font-light">devoted to hair.</em>
        </h1>
        <p className="mt-10 max-w-2xl mx-auto text-lg text-foreground/70 leading-relaxed">
          Studio Demo is a fictional hair studio created to showcase an online booking system. All
          names, texts and images on this site are placeholders for demonstration purposes.
        </p>
      </section>

      <section className="mt-24 md:mt-32">
        <div className="img-zoom mx-auto max-w-[1400px] aspect-[16/9]">
          <img
            src={salon}
            alt="Interior of the salon"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      </section>

      <section className="py-28 md:py-40">
        <div className="mx-auto max-w-[1200px] px-6 md:px-10 grid md:grid-cols-2 gap-16 md:gap-24 items-center">
          <div className="img-zoom aspect-[4/5]">
            <img
              src={teamImg}
              alt="Placeholder image"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div>
            <div className="eyebrow">The Team</div>
            <h2 className="mt-6 font-serif text-4xl md:text-5xl leading-[1.05]">Your team here</h2>
            <div className="mt-8 space-y-5 text-foreground/70 leading-relaxed">
              <p>
                This section is a placeholder for the real team profile: who they are, their
                training and what makes their work different.
              </p>
              <p>
                Profiles are managed from the admin panel (Professionals), so the booking flow
                always reflects the people who actually take appointments.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface py-28 md:py-40">
        <div className="mx-auto max-w-[1000px] px-6 md:px-10 text-center">
          <div className="eyebrow">Our Philosophy</div>
          <h2 className="mt-6 font-serif text-4xl md:text-6xl leading-[1.05]">
            Fewer chairs. More attention.
          </h2>
          <p className="mt-8 text-foreground/70 leading-relaxed text-lg">
            We keep the salon deliberately small so we can keep the standards high. Every
            appointment is unhurried, every consultation is real, and every guest leaves feeling
            more herself than when she arrived.
          </p>
        </div>
      </section>

      <section className="py-28 md:py-40">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="eyebrow">Come visit</div>
            <h2 className="mt-6 font-serif text-4xl md:text-6xl leading-[1.05]">
              The best way to know us is to book.
            </h2>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href="tel:+351000000000" className="btn-primary">
                Book Appointment
              </a>
              <Link to="/contact" className="btn-outline">
                Contact
              </Link>
            </div>
          </div>
          <div className="img-zoom aspect-[4/3]">
            <img
              src={hands}
              alt="Salon craft in detail"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
