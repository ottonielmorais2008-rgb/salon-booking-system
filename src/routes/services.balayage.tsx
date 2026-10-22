import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/service-page";
import balayage from "@/assets/balayage.svg";
import hero from "@/assets/hero.svg";

export const Route = createFileRoute("/services/balayage")({
  head: () => ({
    meta: [
      { title: "Balayage — Studio Demo" },
      {
        name: "description",
        content:
          "Hand-painted balayage. Sun-kissed dimension crafted for a soft grow-out and lasting shine.",
      },
      { property: "og:title", content: "Balayage — Studio Demo" },
      {
        property: "og:description",
        content: "Hand-painted balayage crafted for soft grow-out and lasting shine.",
      },
      { property: "og:image", content: hero },
    ],
    links: [{ rel: "canonical", href: "/services/balayage" }],
  }),
  component: () => (
    <ServicePage
      eyebrow="Signature Service"
      title={
        <>
          Balayage,
          <br />
          <em className="italic font-light">hand-painted.</em>
        </>
      }
      intro="Our signature technique. Free-hand highlights that mimic the way sun would naturally lift your hair — soft at the root, luminous at the ends."
      heroImg={hero}
      detailImg={balayage}
      sections={[
        {
          t: "The technique",
          d: "Every strand is painted by hand, without foils, to create a lived-in blend that grows out gracefully. No harsh regrowth line, no maintenance panic.",
        },
        {
          t: "Who it's for",
          d: "Guests who want dimension without commitment. Balayage flatters most base colours — from deep brunette to natural blonde — and adapts to your skin tone.",
        },
        {
          t: "What to expect",
          d: "A 3 to 4 hour appointment including consultation, painting, processing, a nourishing treatment and a finishing blow-dry. You leave photograph-ready.",
        },
        {
          t: "Longevity",
          d: "A well-executed balayage carries beautifully for 4 to 6 months. We recommend a gloss refresh in between to keep tones warm and luminous.",
        },
      ]}
      faq={[
        {
          q: "Will it damage my hair?",
          a: "No. Because we lift free-hand and use bond-protecting formulas, balayage is one of the gentler colour services when performed with care.",
        },
        {
          q: "Can I go from dark to blonde in one visit?",
          a: "Rarely, and never at the cost of your hair. Dramatic lifts are staged across two or three sessions — we'll map the plan in your consultation.",
        },
        {
          q: "How much does it cost?",
          a: "Balayage is priced on consultation, based on hair length and density. Expect a considered, transparent quote before we begin.",
        },
      ]}
    />
  ),
});
