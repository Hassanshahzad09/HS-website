import type { Metadata } from "next";
import { PricingPage } from "@/sections/PricingPage";

export const metadata: Metadata = {
  title: "AI Studio Pricing",
  description: "The Heritage Shapes AI Studio is free to start: design your packaging with free previews, then add credits if you need more.",
  alternates: { canonical: "/pricing" },
};

export default function Pricing() {
  return <PricingPage />;
}
