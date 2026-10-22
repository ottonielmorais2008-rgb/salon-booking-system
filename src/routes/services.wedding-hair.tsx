import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/service-page";
import wedding from "@/assets/wedding.svg";
import hands from "@/assets/hands.svg";

export const Route = createFileRoute("/services/wedding-hair")({
  head: () => ({
    meta: [
      { title: "Wedding Hair — Studio Demo" },
      {
        name: "description",
        content:
          "Bridal trials, day-of styling and on-location wedding hair. Timeless, considered, unmistakably you.",
      },
      { property: "og:title", content: "Wedding Hair — Studio Demo" },
      { property: "og:description", content: "Bridal trials and day-of styling." },
      { property: "og:image", content: wedding },
    ],
    links: [{ rel: "canonical", href: "/services/wedding-hair" }],
  }),
  component: () => (
    <ServicePage
      eyebrow="Bridal"
      title={
        <>
          The day,
          <br />
          <em className="italic font-light">styled with intention.</em>
        </>
      }
      intro="Bridal hair for brides who want to look like the most beautiful version of themselves — not someone else. Timeless, editorial, considered."
      heroImg={wedding}
      detailImg={hands}
      sections={[
        {
          t: "Trial appointment",
          d: "Booked four to six weeks before the wedding. We rehearse the full look, discuss your dress, veil and jewellery, and photograph the result together.",
        },
        {
          t: "The morning of",
          d: "In-salon or on-location styling for you and up to five members of your bridal party. We arrive on time, quietly, and leave you feeling calm.",
        },
        {
          t: "Trousseau colour",
          d: "Many brides refresh colour two weeks before the wedding — enough time for the tone to settle and for photographs to capture depth beautifully.",
        },
      ]}
      faq={[
        {
          q: "Do you travel for weddings?",
          a: "Yes. We regularly travel across the region for weddings. Travel is quoted separately based on distance.",
        },
        {
          q: "How early do you arrive on the day?",
          a: "Typically three to four hours before the ceremony, so the timeline is unhurried and there's a buffer for photographs.",
        },
      ]}
    />
  ),
});
