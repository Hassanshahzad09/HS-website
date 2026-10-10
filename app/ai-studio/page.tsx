import type { Metadata } from "next";
import { AiStudio } from "@/sections/AiStudio";

export const metadata: Metadata = {
  title: "AI Packaging Studio",
  description: "Pick a Heritage Shapes product, choose the finish, upload your logo and see a realistic mockup of your packaging. Then request a quote for exactly what you see.",
  alternates: { canonical: "/ai-studio" },
};

export default function AiStudioPage() {
  return <AiStudio />;
}
