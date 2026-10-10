import { Star } from "lucide-react";
import { SectionHeading, SplitText } from "@/components/Reveal";
import { stats, testimonials, trustpilot } from "@/data/site";

const average = testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length;
const score = Math.round(average * 10) / 10;

/** Five stars filled to `value` (out of 5), in half-star steps. */
function Stars({ value, className = "size-4" }: { value: number; className?: string }) {
  return (
    <span className="flex items-center gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className={`relative ${className}`}>
            <Star className="absolute inset-0 size-full text-line" fill="currentColor" strokeWidth={0} aria-hidden="true" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={`${className} text-gold`} fill="currentColor" strokeWidth={0} aria-hidden="true" />
            </span>
          </span>
        );
      })}
    </span>
  );
}

/** Trustpilot's green star mark, drawn inline for the trust badge. */
function TrustpilotMark() {
  return (
    <span className="inline-flex items-center gap-1.5 font-semibold tracking-tight">
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <path fill="#00b67a" d="M12 1.5l2.6 7.9H23l-6.8 4.9 2.6 7.9L12 17.3l-6.8 4.9 2.6-7.9L1 9.4h8.4z" />
      </svg>
      Trustpilot
    </span>
  );
}

function Review({ t }: { t: (typeof testimonials)[number] }) {
  return (
    <figure className="flex h-full w-[min(84vw,24rem)] shrink-0 flex-col rounded-[2rem] border border-line bg-surface p-8">
      <div className="flex items-center justify-between">
        <span className="font-serif text-6xl leading-[0.6] text-brand" aria-hidden="true">
          “
        </span>
        <span className="flex items-center gap-2">
          <Stars value={t.rating} />
          <span className="text-sm tabular-nums text-muted">{t.rating.toFixed(1)}</span>
        </span>
      </div>
      <blockquote className="mt-4 text-lg leading-snug tracking-tight sm:text-xl">{t.quote}</blockquote>
      <figcaption className="mt-auto flex items-center gap-4 pt-8">
        <span className="grid size-11 place-items-center rounded-full bg-bg2 font-serif text-lg italic" aria-hidden="true">
          {t.name[0]}
        </span>
        <span>
          <span className="block font-medium">{t.name}</span>
          <span className="block text-sm text-muted">
            {t.role}, {t.company}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

const clients = stats.find((s) => s.label === "Clients");
const countries = stats.find((s) => s.label === "Countries Reached");

/**
 * Centred trust badge. With a Trustpilot link set in data/site.ts it shows the Trustpilot rating;
 * until then it shows the average of the reviews below and the client figures from the numbers strip.
 */
function TrustBadge() {
  const inner = (
    <>
      <span className="flex flex-col items-center gap-1 sm:items-start">
        <span className="text-xs uppercase tracking-[0.16em] text-muted">{trustpilot.url ? "Trusted on" : "Trusted by brands"}</span>
        {trustpilot.url ? <TrustpilotMark /> : <span className="font-semibold tracking-tight">{clients ? `${clients.value}${clients.suffix} clients` : "Our clients"}{countries ? ` in ${countries.value}${countries.suffix} countries` : ""}</span>}
      </span>
      <span className="hidden h-10 w-px bg-line sm:block" aria-hidden="true" />
      <span className="flex flex-col items-center gap-1 sm:items-start">
        <span className="flex items-center gap-2">
          <Stars value={score} />
          <span className="font-medium tabular-nums">{score.toFixed(1)} / 5</span>
        </span>
        <span className="text-sm text-muted">{trustpilot.url ? `Verified by ${trustpilot.reviews} clients` : "Average client rating"}</span>
      </span>
    </>
  );
  const cls = "glass-btn mx-auto flex w-fit flex-col items-center gap-3 rounded-3xl px-6 py-4 text-center text-ink sm:flex-row sm:gap-5 sm:text-left";
  return trustpilot.url ? (
    <a href={trustpilot.url} target="_blank" rel="noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

export function Testimonials() {
  return (
    <section className="overflow-hidden bg-bg2 py-13.5 lg:py-21.5">
      <div className="container-x">
        <div className="mb-12 lg:mb-14">
          <TrustBadge />
        </div>
        <div>
          <SectionHeading eyebrow="In their words">
            <SplitText segments={["What it feels like ", { text: "on the other side.", serif: true }]} />
          </SectionHeading>

        </div>
      </div>

      {/* Endless loop: the list is rendered twice and the track slides by exactly one copy. Hover pauses it. */}
      <div className="marquee mt-10 [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
        <ul className="marquee-track keep-motion flex w-max gap-5" style={{ "--marquee": `${testimonials.length * 7}s` } as React.CSSProperties}>
          {[...testimonials, ...testimonials].map((t, i) => (
            <li key={i} aria-hidden={i >= testimonials.length || undefined} className="flex">
              <Review t={t} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
