import { createFileRoute, Link } from "@tanstack/react-router";
import balayage from "@/assets/balayage.svg";
import hero from "@/assets/hero.svg";
import brunette from "@/assets/brunette.svg";
import wedding from "@/assets/wedding.svg";
import nails from "@/assets/nails.svg";
import styling from "@/assets/styling.svg";
import hands from "@/assets/hands.svg";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Studio Demo" },
      {
        name: "description",
        content:
          "Balayage, blonde, brunette, colour correction, treatments, cuts, styling, wedding hair, nails and beauty.",
      },
      { property: "og:title", content: "Services — Studio Demo" },
      {
        property: "og:description",
        content: "Full menu of premium hair, colour, bridal and beauty services.",
      },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: Services,
});

const catalog = [
  {
    title: "Balayage",
    desc: "Hand-painted highlights that live-in beautifully for months.",
    img: balayage,
    to: "/services/balayage" as const,
  },
  {
    title: "Blonde Hair",
    desc: "Luminous blondes with a focus on tone, condition and longevity.",
    img: hero,
    to: "/services/blonde-hair" as const,
  },
  {
    title: "Brunette Hair",
    desc: "Deep, dimensional brunettes with editorial richness.",
    img: brunette,
    to: "/services/brunette-hair" as const,
  },
  {
    title: "Hair Colour",
    desc: "Bespoke single-process and permanent colour, tailored to skin tone.",
    img: brunette,
    to: "/services" as const,
  },
  {
    title: "Colour Correction",
    desc: "Delicate work to restore compromised or previously coloured hair.",
    img: hero,
    to: "/services" as const,
  },
  {
    title: "Hair Treatments",
    desc: "Professional care rituals and reparative in-salon care for lasting shine.",
    img: hands,
    to: "/services" as const,
  },
  {
    title: "Women's Haircuts",
    desc: "Considered cuts shaped to your hair, face and lifestyle.",
    img: styling,
    to: "/services" as const,
  },
  {
    title: "Styling",
    desc: "Blowouts, waves and event finishes with editorial polish.",
    img: styling,
    to: "/services" as const,
  },
  {
    title: "Wedding Hair",
    desc: "Trials, day-of styling and on-location service for brides.",
    img: wedding,
    to: "/services/wedding-hair" as const,
  },
  {
    title: "Nails",
    desc: "Manicures and gentle nail care in the same considered spirit.",
    img: nails,
    to: "/services/nails" as const,
  },
  {
    title: "Beauty Treatments",
    desc: "Selected beauty rituals to complement your visit.",
    img: nails,
    to: "/services" as const,
  },
];

function Services() {
  return (
    <div className="pt-32 md:pt-40">
      <section className="mx-auto max-w-[1400px] px-6 md:px-10 text-center animate-fade-up">
        <div className="eyebrow">The Menu</div>
        <h1 className="mt-6 font-serif text-5xl md:text-8xl leading-[1] tracking-[-0.02em]">
          Services
        </h1>
        <p className="mt-8 max-w-xl mx-auto text-foreground/70 leading-relaxed">
          A considered list of what we do best. Prices on consultation — every visit begins with a
          conversation.
        </p>
      </section>

      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {catalog.map((s) => (
            <Link key={s.title} to={s.to} className="group block">
              <div className="img-zoom aspect-[4/5]">
                <img
                  src={s.img}
                  alt={s.title}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="pt-5 flex items-baseline justify-between gap-4">
                <h3 className="font-serif text-2xl md:text-3xl">{s.title}</h3>
                <span className="eyebrow shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </span>
              </div>
              <p className="mt-2 text-sm text-foreground/60 max-w-md">{s.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-surface py-28 md:py-40 text-center">
        <div className="mx-auto max-w-[900px] px-6 md:px-10">
          <div className="eyebrow">Reserve</div>
          <h2 className="mt-6 font-serif text-4xl md:text-6xl leading-[1.05]">
            Not sure where to start?
          </h2>
          <p className="mt-6 text-foreground/70 leading-relaxed">
            Call us and describe what you're hoping for — we'll guide you to the right service and
            time.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a href="tel:+351000000000" className="btn-primary">
              Book Appointment
            </a>
            <a href="tel:+351000000000" className="btn-outline">
              Call Now
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
