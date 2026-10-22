import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/service-page";
import nails from "@/assets/nails.svg";
import hands from "@/assets/hands.svg";

export const Route = createFileRoute("/services/nails")({
  head: () => ({
    meta: [
      { title: "Nails — Studio Demo" },
      {
        name: "description",
        content: "Manicures and considered nail care in the same quiet spirit as our hair work.",
      },
      { property: "og:title", content: "Nails — Studio Demo" },
      { property: "og:description", content: "Manicures and quiet nail care." },
      { property: "og:image", content: nails },
    ],
    links: [{ rel: "canonical", href: "/services/nails" }],
  }),
  component: () => (
    <ServicePage
      eyebrow="Beauty"
      title={
        <>
          Nails,
          <br />
          <em className="italic font-light">a quiet ritual.</em>
        </>
      }
      intro="Manicures for the woman who wants her hands to feel as considered as the rest of her look. Clean lines, honest colour, healthy nails."
      heroImg={nails}
      detailImg={hands}
      sections={[
        {
          t: "Classic manicure",
          d: "Shape, cuticle care, hand massage and a colour of your choosing — from the softest nude to a deep editorial red.",
        },
        {
          t: "Gel manicure",
          d: "For a finish that lasts two to three weeks without chipping. Removed gently, always, to protect the nail bed.",
        },
        {
          t: "Nail care",
          d: "Regular guests can enrol in a maintenance rhythm that keeps nails strong between services. We'll design one that fits your life.",
        },
      ]}
    />
  ),
});
