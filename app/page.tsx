import dynamic from "next/dynamic";
import { BrandStatement } from "@/sections/BrandStatement";
import { Hero } from "@/sections/Hero";
import { ProductShowcase } from "@/sections/ProductShowcase";

// Everything below the first screens is split into its own chunk.
const BeforeAfter = dynamic(() => import("@/sections/BeforeAfter").then((m) => m.BeforeAfter));
const Showcase = dynamic(() => import("@/sections/Showcase").then((m) => m.Showcase));
const BrandKits = dynamic(() => import("@/sections/BrandKits").then((m) => m.BrandKits));
const Ribbon = dynamic(() => import("@/sections/Ribbon").then((m) => m.Ribbon));
const Why = dynamic(() => import("@/sections/Why").then((m) => m.Why));
const Global = dynamic(() => import("@/sections/Global").then((m) => m.Global));
const Numbers = dynamic(() => import("@/sections/Numbers").then((m) => m.Numbers));
const Testimonials = dynamic(() => import("@/sections/Testimonials").then((m) => m.Testimonials));
const Cinematic = dynamic(() => import("@/sections/Cinematic").then((m) => m.Cinematic));
const Contact = dynamic(() => import("@/sections/Contact").then((m) => m.Contact));

// INTRO → BRAND → PRODUCTS → CRAFT → CUSTOMISATION → TRUST → CONTACT
export default function HomePage() {
  return (
    <>
      <Hero />
      <BrandStatement />
      <ProductShowcase />
      <BeforeAfter />
      <Showcase />
      <BrandKits />
      <Ribbon />
      <Why />
      <Global />
      <Numbers />
      <Testimonials />
      <Cinematic />
      <Contact />
    </>
  );
}
