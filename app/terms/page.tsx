import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/data/site";
import { LegalPage } from "@/sections/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms for using the Heritage Shapes website, accounts, the AI Packaging Studio and quote requests.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      updated="14 October 2026"
      intro={
        <p>
          These terms apply when you use the {site.name} website, create an account, use the AI Packaging Studio or request a quote. By using the site you agree to them. Questions? Email{" "}
          <a href={`mailto:${site.email}`} className="text-ink underline underline-offset-4">
            {site.email}
          </a>
          .
        </p>
      }
    >
      <section>
        <h2>Using the site</h2>
        <ul>
          <li>Use the site lawfully and only for genuine enquiries about our products.</li>
          <li>Do not try to break, overload or get around the site&rsquo;s limits, for example by automating requests or creating accounts to collect free credits.</li>
          <li>Keep your login details private. You are responsible for activity on your account.</li>
          <li>We may suspend accounts that break these terms.</li>
        </ul>
      </section>

      <section>
        <h2>Your logos and artwork</h2>
        <ul>
          <li>Only upload logos and artwork that you own or have permission to use.</li>
          <li>Do not upload anything unlawful, offensive, or that copies another company&rsquo;s trademark without permission.</li>
          <li>You keep ownership of your logos. You allow us to store and process them to create your designs and prepare your quotations.</li>
        </ul>
      </section>

      <section>
        <h2>AI Studio images</h2>
        <ul>
          <li>Images from the AI Studio are visualisations to help you picture a product. They are not print proofs.</li>
          <li>Colours, finishes, proportions and logo detail may differ from the manufactured product. The final product is based on the specification and proof agreed in writing for your order.</li>
          <li>The AI can occasionally make mistakes. If an image looks wrong, you can report it from the Studio.</li>
        </ul>
      </section>

      <section>
        <h2>Credits</h2>
        <ul>
          <li>Credits are used to create AI Studio images. Free credits and previews have no cash value and cannot be transferred or exchanged.</li>
          <li>If an image fails to generate, the credit is returned automatically.</li>
          <li>We may change the number of free credits and previews we offer. Credits already in your account are not affected by such a change.</li>
        </ul>
      </section>

      <section>
        <h2>Quotes and orders</h2>
        <ul>
          <li>A quote request is not an order, and prices shown on the site are not offers.</li>
          <li>Prices, quantities, lead times and delivery terms are confirmed in a written quotation. An order is only agreed when we both confirm it in writing.</li>
          <li>Samples, proofs and production follow the terms set out in that quotation.</li>
        </ul>
      </section>

      <section>
        <h2>Our content</h2>
        <p>The site&rsquo;s text, photographs, designs and branding belong to {site.name} or its licensors. Please do not copy them without permission.</p>
      </section>

      <section>
        <h2>Liability</h2>
        <p>
          We work to keep the site accurate and available, but we provide it as it is and cannot guarantee it will always be error-free or uninterrupted. Nothing in these terms limits liability that cannot be limited by law.
        </p>
      </section>

      <section>
        <h2>Privacy</h2>
        <p>
          How we handle your information is explained in our <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>We may update these terms. The date at the top shows the latest version, and continued use of the site means you accept the updated terms.</p>
      </section>
    </LegalPage>
  );
}
