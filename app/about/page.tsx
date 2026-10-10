import type { Metadata } from "next";
import { AboutPage } from "@/sections/AboutPage";

export const metadata: Metadata = {
  title: "About Us",
  description: "Six years of custom packaging: sourcing in China, production in Pakistan and operations in the UK. Meet the team behind Heritage Shapes and see how your packaging gets made.",
  alternates: { canonical: "/about" },
};

export default function About() {
  return <AboutPage />;
}
