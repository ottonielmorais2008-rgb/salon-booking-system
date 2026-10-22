import { createFileRoute } from "@tanstack/react-router";
import salon from "@/assets/salon.svg";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Visit — Studio Demo" },
      {
        name: "description",
        content:
          "Fictional demo address. Opening hours, phone, Instagram and directions to Studio Demo.",
      },
      { property: "og:title", content: "Contact — Studio Demo" },
      {
        property: "og:description",
        content: "Find the studio — hours, phone, Instagram and directions.",
      },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  return (
    <div className="pt-32 md:pt-40">
      <section className="mx-auto max-w-[1400px] px-6 md:px-10 animate-fade-up">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">
          <div>
            <div className="eyebrow">Visit us</div>
            <h1 className="mt-6 font-serif text-5xl md:text-7xl leading-[1] tracking-[-0.02em]">
              Rua Exemplo 123 <br />
              <em className="italic font-light">Cidade Demo.</em>
            </h1>
            <p className="mt-8 max-w-md text-foreground/70 leading-relaxed">
              A quiet room, a warm welcome. We recommend booking a week ahead — walk-ins are welcome
              when the chair is free.
            </p>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div>
                <div className="eyebrow mb-3">Hours</div>
                <p className="text-sm leading-relaxed">
                  Tuesday – Friday
                  <br />
                  10:00 – 20:00
                  <br />
                  <br />
                  Saturday
                  <br />
                  09:00 – 18:00
                  <br />
                  <br />
                  Sunday – Monday
                  <br />
                  Closed
                </p>
              </div>
              <div>
                <div className="eyebrow mb-3">Contact</div>
                <a href="tel:+351000000000" className="link-underline block text-sm">
                  +351 000 000 000
                </a>
                <a href="mailto:hello@example.com" className="link-underline block text-sm mt-2">
                  hello@example.com
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="link-underline block text-sm mt-2"
                >
                  @studio.demo
                </a>
                <a
                  href="https://maps.google.com/?q=Portugal"
                  target="_blank"
                  rel="noreferrer"
                  className="link-underline block text-sm mt-2"
                >
                  Google Maps
                </a>
              </div>
            </div>

            <div className="mt-12 flex flex-wrap gap-4">
              <a href="tel:+351000000000" className="btn-primary">
                Call Now
              </a>
              <a href="tel:+351000000000" className="btn-outline">
                Book Appointment
              </a>
            </div>
          </div>

          <div className="img-zoom aspect-[4/5]">
            <img
              src={salon}
              alt="Salon interior"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="mt-28 md:mt-40">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="aspect-[16/8] w-full overflow-hidden border border-border">
            <iframe
              title="Studio Demo on the map"
              src="https://www.google.com/maps?q=Portugal&output=embed"
              className="h-full w-full grayscale"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
