import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/data/site";
import { LegalPage } from "@/sections/LegalPage";
import { CookieSettingsLink } from "@/components/CookieConsent";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Heritage Shapes collects, uses and protects your information, including quote requests, accounts, AI Studio logos and cookies.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="14 October 2026"
      intro={
        <p>
          This policy explains what information {site.name} collects when you use {site.url.replace("https://", "")}, why we collect it, who helps us process it, and the choices you have. If anything is unclear, email us at{" "}
          <a href={`mailto:${site.email}`} className="text-ink underline underline-offset-4">
            {site.email}
          </a>
          .
        </p>
      }
    >
      <section>
        <h2>Who we are</h2>
        <p>
          {site.name} makes custom printing and packaging. Production is in Pakistan and operations are run from the United Kingdom. {site.name} is responsible for the personal information described in this policy. You can reach us at{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </section>

      <section>
        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Quote requests and messages:</strong> your name, company, email address, country, the products and options you choose, quantities, the name of any artwork file you mention, and your message.
          </li>
          <li>
            <strong>Newsletter:</strong> your email address.
          </li>
          <li>
            <strong>Your account:</strong> your email address, password (stored only in encrypted form by our login provider), name, company and phone number if you add them, your saved designs, your credit balance and your quote requests.
          </li>
          <li>
            <strong>AI Studio:</strong> the logo files you upload, the product options you choose, and the images created for you. Uploaded logos are re-saved as clean image files and stored privately.
          </li>
          <li>
            <strong>Usage limits and security:</strong> to stop the free AI Studio previews being misused, we keep a one-way scrambled (hashed) version of your internet address and a random visitor ID in a cookie. We do not store your internet address itself for this purpose.
          </li>
          <li>
            <strong>Analytics (only if you agree):</strong> pages visited, how you arrived, approximate location, device and browser type, collected by Google Analytics.
          </li>
        </ul>
      </section>

      <section>
        <h2>Why we use it</h2>
        <ul>
          <li>To reply to your enquiries, prepare quotations and follow up on them (steps you ask us to take before a contract, and our legitimate interest in running our business).</li>
          <li>To provide your account and the AI Studio, including creating images of your logo on our products (to provide the service you asked for).</li>
          <li>To prevent abuse of free features and keep the site secure (our legitimate interest).</li>
          <li>To send the newsletter you signed up for. You can ask us to stop at any time.</li>
          <li>To understand how the site is used and improve it, using analytics only when you have agreed to analytics cookies (your consent).</li>
        </ul>
      </section>

      <section>
        <h2>Who helps us process it</h2>
        <p>We use trusted service providers who process information on our behalf and only for the purposes above:</p>
        <ul>
          <li>
            <strong>Supabase:</strong> our database, login system and private file storage.
          </li>
          <li>
            <strong>Vercel:</strong> hosting for the website.
          </li>
          <li>
            <strong>Google (Gemini API):</strong> when you create a design in the AI Studio, your logo and the chosen product options are sent to Google&rsquo;s image model to produce the picture.
          </li>
          <li>
            <strong>Google Analytics:</strong> website statistics, only with your consent.
          </li>
          <li>
            <strong>Resend</strong> and <strong>ImprovMX:</strong> sending and forwarding our emails, including notifications about your enquiry.
          </li>
        </ul>
        <p>We do not sell your personal information. We share it with others only when the law requires us to.</p>
      </section>

      <section>
        <h2>Where it is stored</h2>
        <p>
          Our providers may store and process information outside the United Kingdom and the European Economic Area, including in the United States and Asia. Where that happens, we rely on the safeguards those providers offer for international transfers, such as standard contractual clauses.
        </p>
      </section>

      <section>
        <h2>How long we keep it</h2>
        <ul>
          <li>Enquiries and quotations: for as long as needed to deal with them and maintain our business records.</li>
          <li>Accounts, saved designs and uploaded logos: until you delete them or ask us to close your account.</li>
          <li>Designs made without an account: linked to a random visitor ID; ask us if you would like them removed.</li>
          <li>Analytics data: according to the retention period set in Google Analytics.</li>
        </ul>
      </section>

      <section>
        <h2>Cookies and similar storage</h2>
        <ul>
          <li>
            <strong>Essential:</strong> keeping you logged in, remembering your free AI Studio previews, remembering your light or dark theme, and remembering your cookie choice. The site cannot work properly without these.
          </li>
          <li>
            <strong>Analytics (optional):</strong> Google Analytics cookies, set only if you click &ldquo;Accept&rdquo; on the cookie banner.
          </li>
        </ul>
        <p>
          You can change your choice at any time: <CookieSettingsLink className="text-ink underline underline-offset-4" />.
        </p>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>
          Depending on where you live, you can ask to see the information we hold about you, correct it, delete it, restrict or object to how we use it, or receive a copy. Where we rely on consent, you can withdraw it at any time. To make a request, email{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>. If you are in the UK you can also complain to the Information Commissioner&rsquo;s Office (ico.org.uk), or in the EU to your local data protection authority.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>Our services are for businesses and are not intended for anyone under 16.</p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          We may update this policy as the site changes. The date at the top shows the latest version. See also our <Link href="/terms">Terms of Use</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
