import { createFileRoute, Link } from "@tanstack/react-router";
import balayage from "@/assets/balayage.svg";
import hero from "@/assets/hero.svg";
import brunette from "@/assets/brunette.svg";
import wedding from "@/assets/wedding.svg";
import nails from "@/assets/nails.svg";
import styling from "@/assets/styling.svg";
import hands from "@/assets/hands.svg";
import salon from "@/assets/salon.svg";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Studio Demo" },
      {
        name: "description",
        content:
          "Editorial photography, before & after transformations and Instagram reels from our studio.",
      },
      { property: "og:title", content: "Gallery — Studio Demo" },
      {
        property: "og:description",
        content: "Editorial photography and transformations from our studio.",
      },
    ],
    links: [{ rel: "canonical", href: "/gallery" }],
  }),
  component: Gallery,
});

const grid = [
  { img: hero, span: "md:col-span-8 md:row-span-2", ratio: "aspect-[4/5]" },
  { img: balayage, span: "md:col-span-4", ratio: "aspect-[4/5]" },
  { img: brunette, span: "md:col-span-4", ratio: "aspect-square" },
  { img: wedding, span: "md:col-span-6", ratio: "aspect-[4/3]" },
  { img: styling, span: "md:col-span-6", ratio: "aspect-[4/3]" },
  { img: hands, span: "md:col-span-8", ratio: "aspect-[16/9]" },
  { img: nails, span: "md:col-span-4", ratio: "aspect-[3/4]" },
  { img: salon, span: "md:col-span-12", ratio: "aspect-[16/7]" },
];

function Gallery() {
  return (
    <div className="pt-32 md:pt-40">
      <section className="mx-auto max-w-[1400px] px-6 md:px-10 text-center animate-fade-up">
        <div className="eyebrow">Gallery</div>
        <h1 className="mt-6 font-serif text-5xl md:text-8xl leading-[1] tracking-[-0.02em]">
          The work, unretouched.
        </h1>
        <p className="mt-8 max-w-xl mx-auto text-foreground/70 leading-relaxed">
          Editorial frames, guest transformations, and quiet details from inside the atelier.
        </p>
      </section>

      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 grid grid-cols-4 md:grid-cols-12 gap-4 md:gap-6">
          {grid.map((g, i) => (
            <div key={i} className={`col-span-4 ${g.span}`}>
              <div className={`img-zoom w-full ${g.ratio}`}>
                <img src={g.img} alt="" loading="lazy" className="h-full w-full object-cover" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface py-28 md:py-40 text-center">
        <div className="mx-auto max-w-[900px] px-6 md:px-10">
          <div className="eyebrow">Follow</div>
          <h2 className="mt-6 font-serif text-4xl md:text-6xl leading-[1.05]">
            More on Instagram.
          </h2>
          <p className="mt-6 text-foreground/70 leading-relaxed">
            We share daily work, reels and behind-the-scenes moments on @studio.demo.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="btn-outline"
            >
              @studio.demo
            </a>
            <Link to="/contact" className="btn-primary">
              Book Your Visit
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
