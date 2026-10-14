import type { Metadata } from "next";
import { faqs } from "@/data/site";
import { Faq } from "@/sections/Faq";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about custom packaging orders: minimum quantities, samples, finishes, artwork, shipping and quotations.",
  alternates: { canonical: "/faq" },
};

// Lets Google show these questions and answers directly in search results.
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function FaqPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Faq standalone />
    </>
  );
}
