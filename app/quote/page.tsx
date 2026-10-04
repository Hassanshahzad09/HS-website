import type { Metadata } from "next";
import { QuoteBuilder } from "@/sections/QuoteBuilder";

export const metadata: Metadata = {
  title: "Request a Quote",
  description: "Build a quote for custom packaging, labels, stickers or branded products in four short steps.",
  alternates: { canonical: "/quote" },
};

export default function QuotePage() {
  return <QuoteBuilder standalone />;
}
