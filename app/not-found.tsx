import { ButtonLink } from "@/components/Button";
import { LogoMark } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[90svh] flex-col items-start justify-center pb-24 pt-32">
      <LogoMark className="w-20 text-line" />
      <p className="eyebrow mt-10">404</p>
      <h1 className="display mt-4 text-[clamp(2.6rem,7vw,6rem)]">
        This page was never <span className="text-gradient">printed.</span>
      </h1>
      <p className="mt-6 max-w-md text-lg text-muted">The link may be old, or the page has moved. The catalogue is a good place to pick things back up.</p>
      <div className="mt-9 flex flex-wrap gap-3">
        <ButtonLink href="/products">Explore Products</ButtonLink>
        <ButtonLink href="/" variant="outline">
          Back to home
        </ButtonLink>
      </div>
    </div>
  );
}
