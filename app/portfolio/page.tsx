import type { Metadata } from "next";
import { Portfolio } from "@/sections/Portfolio";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Concept projects showing how materials and finishes come together across a full brand set: bags, labels, ribbon, cards and more.",
  alternates: { canonical: "/portfolio" },
};

export default function PortfolioPage() {
  return <Portfolio standalone />;
}
