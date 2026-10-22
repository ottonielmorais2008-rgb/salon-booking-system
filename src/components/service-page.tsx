import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export interface ServicePageProps {
  eyebrow: string;
  title: ReactNode;
  intro: string;
  heroImg: string;
  detailImg: string;
  sections: { t: string; d: string }[];
  faq?: { q: string; a: string }[];
}

export function ServicePage({
  eyebrow,
  title,
  intro,
  heroImg,
  detailImg,
  sections,
  faq,
}: ServicePageProps) {
  return (
    <div className="pt-32 md:pt-40">
      <section className="mx-auto max-w-[1400px] px-6 md:px-10 grid md:grid-cols-2 gap-16 md:gap-24 items-center animate-fade-up">
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h1 className="mt-6 font-serif text-5xl md:text-7xl leading-[1] tracking-[-0.02em]">
            {title}
          </h1>
          <p className="mt-8 max-w-md text-foreground/70 leading-relaxed text-lg">{intro}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a href="tel:+351000000000" className="btn-primary">
              Book Appointment
            </a>
            <Link to="/services" className="btn-outline">
              All Services
            </Link>
          </div>
        </div>
        <div className="img-zoom aspect-[4/5]">
          <img src={heroImg} alt="" className="h-full w-full object-cover" loading="lazy" />
        </div>
      </section>

      <section className="py-28 md:py-40">
        <div className="mx-auto max-w-[1200px] px-6 md:px-10">
          <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">
            <div className="md:sticky md:top-32">
              <div className="img-zoom aspect-[4/5]">
                <img src={detailImg} alt="" className="h-full w-full object-cover" loading="lazy" />
              </div>
            </div>
            <div>
              {sections.map((s, i) => (
                <div key={s.t} className={`py-8 ${i !== 0 ? "border-t border-border" : ""}`}>
                  <h2 className="font-serif text-3xl md:text-4xl">{s.t}</h2>
                  <p className="mt-4 text-foreground/70 leading-relaxed">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {faq && (
        <section className="bg-surface py-24 md:py-32">
          <div className="mx-auto max-w-[1000px] px-6 md:px-10">
            <div className="eyebrow text-center">Questions</div>
            <h2 className="mt-6 text-center font-serif text-4xl md:text-5xl leading-[1.05]">
              Good to know.
            </h2>
            <div className="mt-12 divide-y divide-border border-y border-border">
              {faq.map((f) => (
                <details key={f.q} className="group py-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6">
                    <h3 className="font-serif text-xl md:text-2xl">{f.q}</h3>
                    <span className="font-serif text-2xl transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 text-foreground/70 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-28 md:py-40 text-center">
        <div className="mx-auto max-w-[900px] px-6 md:px-10">
          <div className="eyebrow">Reserve</div>
          <h2 className="mt-6 font-serif text-4xl md:text-6xl leading-[1.05]">
            Ready when you are.
          </h2>
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
