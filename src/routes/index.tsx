import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero.svg";
import heroPortrait from "@/assets/hero-portrait.svg";
import salon from "@/assets/salon.svg";
import balayage from "@/assets/balayage.svg";
import brunette from "@/assets/brunette.svg";
import wedding from "@/assets/wedding.svg";
import nails from "@/assets/nails.svg";
import hands from "@/assets/hands.svg";
import styling from "@/assets/styling.svg";
import teamImg from "@/assets/team.svg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Studio Demo — Salon Booking Demo" },
      {
        name: "description",
        content:
          "Balayage, hair colour, bridal styling and beauty crafted with precision and care. A fictional salon used to demo online booking.",
      },
      { property: "og:title", content: "Studio Demo — Salon Booking Demo" },
      {
        property: "og:description",
        content:
          "Balayage, hair colour, bridal styling and beauty crafted with precision and care. A fictional salon used to demo online booking.",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const services = [
  {
    title: "Balayage",
    img: balayage,
    to: "/services/balayage" as const,
    desc: "Sun-kissed dimension, hand-painted.",
  },
  {
    title: "Blonde Hair",
    img: hero,
    to: "/services/blonde-hair" as const,
    desc: "Luminous, healthy, unmistakably yours.",
  },
  {
    title: "Brunette Hair",
    img: brunette,
    to: "/services/brunette-hair" as const,
    desc: "Rich tones with editorial depth.",
  },
  {
    title: "Wedding Hair",
    img: wedding,
    to: "/services/wedding-hair" as const,
    desc: "The day, styled with intention.",
  },
  {
    title: "Nails",
    img: nails,
    to: "/services/nails" as const,
    desc: "A quiet ritual for the hands.",
  },
  {
    title: "Styling",
    img: styling,
    to: "/services" as const,
    desc: "Cuts and finishes shaped to you.",
  },
];

const pillars = [
  {
    n: "01",
    t: "Personalised Consultation",
    d: "Every visit begins with a conversation. We listen before we lift a brush.",
  },
  {
    n: "02",
    t: "Professional Techniques",
    d: "Modern colour and cutting techniques, applied with care.",
  },
  {
    n: "03",
    t: "Premium Products",
    d: "Professional-grade, clean formulas chosen for hair health.",
  },
  {
    n: "04",
    t: "Attention to Detail",
    d: "From the first strand to the final mist — nothing is left to chance.",
  },
  {
    n: "05",
    t: "Comfortable Experience",
    d: "Soft light, unhurried pace, quiet luxury. A moment that feels like yours.",
  },
];

const journey = [
  {
    n: "I",
    t: "Consultation",
    d: "We talk through your hair story, lifestyle and the mood you'd like to carry.",
  },
  {
    n: "II",
    t: "Diagnosis",
    d: "Scalp, condition, porosity and history — a plan built around your hair's truth.",
  },
  {
    n: "III",
    t: "Transformation",
    d: "Colour, cut and treatment executed with intention. Slow, precise, considered.",
  },
  {
    n: "IV",
    t: "Final Styling",
    d: "A finish you can recreate at home — with the products and rituals to keep it alive.",
  },
];

const faqs = [
  {
    q: "How long does a balayage last?",
    a: "A well-executed balayage can carry beautifully for four to six months. We often refresh with a gloss between visits to keep tones luminous.",
  },
  {
    q: "How often should I colour my hair?",
    a: "Every six to eight weeks for root work, longer for lived-in colour. In your consultation we'll build a rhythm that fits your hair and life.",
  },
  {
    q: "How do I book?",
    a: "Call us at +351 000 000 000, message us on Instagram, or use the booking button — we reply within the day.",
  },
  {
    q: "Which treatments do you recommend?",
    a: "It depends on your hair. Most guests benefit from an in-salon treatment ritual paired with a tailored home routine.",
  },
  {
    q: "Do you offer bridal trials?",
    a: "Yes. We recommend a trial four to six weeks before the wedding, followed by an in-home or on-location service on the day.",
  },
];

function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[100svh] pt-24 md:pt-0 flex items-center overflow-hidden bg-surface">
        <div className="mx-auto max-w-[1400px] w-full px-6 md:px-10 grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="animate-fade-up">
            <h1 className="mt-6 font-serif text-[clamp(2.8rem,7vw,6rem)] leading-[0.95] tracking-[-0.02em]">
              Beauty that reflects <em className="italic font-light">your</em> confidence.
            </h1>
            <p className="mt-8 max-w-md text-base leading-relaxed text-foreground/70">
              Hair crafted with precision, colour and care — in the quiet, considered rooms of our
              studio.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href="tel:+351000000000" className="btn-primary">
                Book Appointment
              </a>
              <a href="tel:+351000000000" className="btn-outline">
                Call Now
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="img-zoom aspect-[4/5] w-full animate-reveal">
              <img
                src={heroPortrait}
                alt="Placeholder image"
                className="h-full w-full object-cover"
                width={1600}
                height={1800}
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden md:block bg-background px-6 py-4 border border-border">
              <div className="eyebrow">Demo studio</div>
              <div className="font-serif text-2xl mt-1">Rua Exemplo 123</div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="py-28 md:py-40">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="grid md:grid-cols-[1fr_2fr] gap-16 md:gap-24 items-start">
            <div className="md:sticky md:top-32">
              <div className="eyebrow">Why Studio Demo</div>
              <h2 className="mt-6 font-serif text-4xl md:text-6xl leading-[1.05]">
                A salon built on trust, quiet craft and time.
              </h2>
            </div>
            <div>
              {pillars.map((p, i) => (
                <div
                  key={p.n}
                  className={`grid grid-cols-[auto_1fr] gap-8 md:gap-12 py-8 ${i !== 0 ? "border-t border-border" : ""}`}
                >
                  <div className="font-serif text-2xl text-muted-foreground italic">{p.n}</div>
                  <div>
                    <h3 className="font-serif text-2xl md:text-3xl">{p.t}</h3>
                    <p className="mt-3 text-foreground/70 leading-relaxed max-w-lg">{p.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-surface py-28 md:py-40">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="flex items-end justify-between gap-8 mb-16">
            <div>
              <div className="eyebrow">Featured Services</div>
              <h2 className="mt-6 font-serif text-4xl md:text-6xl leading-[1.05]">
                The atelier menu.
              </h2>
            </div>
            <Link
              to="/services"
              className="link-underline hidden md:block text-[0.72rem] uppercase tracking-[0.28em]"
            >
              All Services
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {services.map((s) => (
              <Link key={s.title} to={s.to} className="group block">
                <div className="img-zoom aspect-[3/4]">
                  <img
                    src={s.img}
                    alt={s.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="pt-5 flex items-baseline justify-between gap-4">
                  <h3 className="font-serif text-2xl md:text-3xl">{s.title}</h3>
                  <span className="eyebrow shrink-0">Discover →</span>
                </div>
                <p className="mt-2 text-sm text-foreground/60">{s.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BEFORE / AFTER GALLERY */}
      <section className="py-28 md:py-40">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="max-w-2xl mb-16">
            <div className="eyebrow">Before &amp; After</div>
            <h2 className="mt-6 font-serif text-4xl md:text-6xl leading-[1.05]">
              The quiet transformations.
            </h2>
          </div>
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 md:col-span-7 img-zoom aspect-[4/3]">
              <img
                src={balayage}
                alt="Balayage transformation"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="col-span-6 md:col-span-5 img-zoom aspect-[3/4]">
              <img
                src={brunette}
                alt="Brunette colour"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="col-span-6 md:col-span-5 img-zoom aspect-[3/4] md:mt-8">
              <img
                src={hero}
                alt="Blonde transformation"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="col-span-12 md:col-span-7 img-zoom aspect-[4/3]">
              <img
                src={hands}
                alt="Salon detail"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="mt-10 flex justify-center">
            <Link to="/gallery" className="btn-outline">
              View the full gallery
            </Link>
          </div>
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="bg-surface py-28 md:py-40">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div>
              <div className="eyebrow">Instagram</div>
              <h2 className="mt-6 font-serif text-4xl md:text-6xl leading-[1.05]">@studio.demo</h2>
            </div>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="link-underline text-[0.72rem] uppercase tracking-[0.28em]"
            >
              Follow along →
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[balayage, wedding, brunette, hero, hands, styling, nails, salon].map((img, i) => (
              <a
                key={i}
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="img-zoom aspect-square"
              >
                <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CLIENT EXPERIENCE */}
      <section className="py-28 md:py-40">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 grid md:grid-cols-2 gap-16 md:gap-24 items-center">
          <div className="img-zoom aspect-[4/5] order-2 md:order-1">
            <img
              src={teamImg}
              alt="Placeholder image"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="order-1 md:order-2">
            <div className="eyebrow">The Experience</div>
            <h2 className="mt-6 font-serif text-4xl md:text-6xl leading-[1.05]">
              Four moments, one afternoon.
            </h2>
            <div className="mt-10">
              {journey.map((j, i) => (
                <div
                  key={j.n}
                  className={`grid grid-cols-[auto_1fr] gap-8 py-6 ${i !== 0 ? "border-t border-border" : ""}`}
                >
                  <div className="font-serif italic text-xl text-muted-foreground w-10">{j.n}</div>
                  <div>
                    <h3 className="font-serif text-2xl">{j.t}</h3>
                    <p className="mt-2 text-foreground/70 leading-relaxed">{j.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-surface py-28 md:py-40">
        <div className="mx-auto max-w-[1200px] px-6 md:px-10">
          <div className="text-center mb-16">
            <div className="eyebrow">FAQ</div>
            <h2 className="mt-6 font-serif text-4xl md:text-6xl leading-[1.05]">
              Everything, gently answered.
            </h2>
          </div>
          <div className="divide-y divide-border border-y border-border">
            {faqs.map((f) => (
              <details key={f.q} className="group py-6 md:py-8">
                <summary className="flex cursor-pointer items-center justify-between gap-6 list-none">
                  <h3 className="font-serif text-xl md:text-2xl pr-6">{f.q}</h3>
                  <span className="shrink-0 font-serif text-2xl transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-3xl text-foreground/70 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32 md:py-52 overflow-hidden">
        <img
          src={salon}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-background/70" />
        <div className="relative mx-auto max-w-[1000px] px-6 md:px-10 text-center">
          <div className="eyebrow">Reserve your visit</div>
          <h2 className="mt-6 font-serif text-5xl md:text-7xl leading-[1] tracking-[-0.02em]">
            Your chair is waiting.
          </h2>
          <p className="mt-8 max-w-xl mx-auto text-foreground/70 leading-relaxed">
            Book directly with our team. We reply within the day and can usually offer an
            appointment within the week.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a href="tel:+351000000000" className="btn-primary">
              Book Appointment
            </a>
            <Link to="/contact" className="btn-outline">
              Visit the studio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
