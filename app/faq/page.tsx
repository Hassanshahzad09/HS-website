import type { Metadata } from "next";
import { Faq } from "@/sections/Faq";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about custom packaging orders: minimum quantities, samples, finishes, artwork, shipping and quotations.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return <Faq standalone />;
}
