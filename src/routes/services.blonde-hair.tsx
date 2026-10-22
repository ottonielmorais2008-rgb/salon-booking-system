import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/service-page";
import hero from "@/assets/hero.svg";
import balayage from "@/assets/balayage.svg";

export const Route = createFileRoute("/services/blonde-hair")({
  head: () => ({
    meta: [
      { title: "Blonde Hair Specialists — Studio Demo" },
      {
        name: "description",
        content:
          "Luminous, healthy blondes crafted — highlights, full blonde, and platinum work with a focus on tone and condition.",
      },
      { property: "og:title", content: "Blonde Hair Specialists — Studio Demo" },
      {
        property: "og:description",
        content: "Luminous blondes with a focus on tone and condition.",
      },
      { property: "og:image", content: hero },
    ],
    links: [{ rel: "canonical", href: "/services/blonde-hair" }],
  }),
  component: () => (
    <ServicePage
      eyebrow="Colour"
      title={
        <>
          Blonde,
          <br />
          <em className="italic font-light">the healthy way.</em>
        </>
      }
      intro="From soft champagne to icy platinum. Our blonde work is built around tone, gloss and the condition of your hair — never at its expense."
      heroImg={hero}
      detailImg={balayage}
      sections={[
        {
          t: "Consultation first",
          d: "We look at your base, your history, and the blonde in your head. Then we agree — honestly — on what's achievable in one visit versus a staged plan.",
        },
        {
          t: "Bond-protected lifting",
          d: "Every lift is paired with Olaplex or K18 protocols so the integrity of your hair is protected through the process.",
        },
        {
          t: "Toning as a craft",
          d: "The difference between a good blonde and a great one is the gloss. We tone with a painter's eye — warm honey, cool pearl, or something in between.",
        },
        {
          t: "Home care that lasts",
          d: "We finish with a tailored blonde home-care routine tailored for you — because the salon result should last months, not weeks.",
        },
      ]}
    />
  ),
});
