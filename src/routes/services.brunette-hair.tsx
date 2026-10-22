import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/service-page";
import brunette from "@/assets/brunette.svg";

export const Route = createFileRoute("/services/brunette-hair")({
  head: () => ({
    meta: [
      { title: "Brunette Hair Colour — Studio Demo" },
      {
        name: "description",
        content:
          "Dimensional brunette colour — chocolate, chestnut, espresso and lived-in browns crafted in our studio.",
      },
      { property: "og:title", content: "Brunette Hair Colour — Studio Demo" },
      { property: "og:description", content: "Dimensional brunettes with editorial richness." },
      { property: "og:image", content: brunette },
    ],
    links: [{ rel: "canonical", href: "/services/brunette-hair" }],
  }),
  component: () => (
    <ServicePage
      eyebrow="Colour"
      title={
        <>
          Brunette,
          <br />
          <em className="italic font-light">with depth.</em>
        </>
      }
      intro="Rich, dimensional browns — from espresso to warm chestnut — with the shine that makes brunette hair unforgettable."
      heroImg={brunette}
      detailImg={brunette}
      sections={[
        {
          t: "Never flat, never dull",
          d: "We layer soft lowlights, face-framing highlights and glosses so your brunette moves in the light — never one dimensional.",
        },
        {
          t: "Tone-matched to you",
          d: "Warm skin tones lift beautifully into caramel and honey; cool tones sing with cocoa and espresso. We build the palette around your complexion.",
        },
        {
          t: "Gloss finish",
          d: "Every brunette service ends with a bespoke gloss for that glass-like shine that defines premium colour work.",
        },
      ]}
    />
  ),
});
