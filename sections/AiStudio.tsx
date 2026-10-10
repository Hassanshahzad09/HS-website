"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  FolderPlus,
  ImageUp,
  Info,
  LayoutGrid,
  Pencil,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  TriangleAlert,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { AiBadge } from "@/components/AiBadge";
import { Arrow, buttonClass } from "@/components/buttonStyles";
import { categoryName, products, type Product } from "@/data/products";
import { cn, EASE } from "@/lib/utils";

/*
 * AI Packaging Studio — interface only.
 * Generation is simulated: nothing is uploaded and no AI model is called. The "result" is a
 * sample photo of the chosen product and finish, clearly labelled as such. See the PRD
 * (Heritage_Shapes_PRD_4_Phases.docx, sections 16 and 26) for the screens this follows.
 */

const FREE_PREVIEWS = 2;

// Products the Studio can visualise at launch (PRD: 6 to 8 products).
const STUDIO_SLUGS = ["shopping-bags", "tote-bags", "pouches", "thank-you-cards", "woven-labels", "ribbons", "stickers", "butter-paper"];

const COLOURS = [
  { name: "Matte Black", hex: "#17191c" },
  { name: "Ivory", hex: "#efe8da" },
  { name: "Natural Kraft", hex: "#b9966a" },
  { name: "Forest Green", hex: "#1f4d3a" },
  { name: "Burgundy", hex: "#6b1f2a" },
  { name: "Navy", hex: "#0d3f5f" },
  { name: "Blush", hex: "#e8cfc2" },
  { name: "Sage", hex: "#8a9a82" },
];
const SIZES = ["Small", "Medium", "Large", "Custom"];
const PLACEMENTS = ["Centre front", "Upper centre", "Lower corner", "All-over repeat"];

const STAGES = ["Preparing your logo", "Setting up the studio shot", "Applying your finish", "Lighting and final details"];

type Logo = { url: string; name: string; width: number; height: number; transparent: boolean; kb: number };
type Config = { colour: string; material: string; finish: string; size: string; placement: string };
type Result = { id: number; image: string; config: Config; product: Product };

const chip = (active: boolean) =>
  cn("glass-btn rounded-full px-3.5 py-2 text-sm", active ? "[--gb:color-mix(in_srgb,var(--ink)_82%,transparent)] text-bg" : "text-muted hover:text-ink");

/** The sample photo that best matches the chosen finish, standing in for a generated image. */
function sampleImage(p: Product, finishName: string) {
  const effect = p.finishes.find((f) => f.name === finishName)?.effect;
  return p.variants?.find((v) => v.effect === effect)?.image ?? p.image;
}

export function AiStudio() {
  const studioProducts = useMemo(() => STUDIO_SLUGS.map((s) => products.find((p) => p.slug === s)).filter((p): p is Product => Boolean(p)), []);

  const workspace = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [product, setProduct] = useState<Product>(studioProducts[0]);
  const [config, setConfig] = useState<Config>(() => defaults(studioProducts[0]));
  const [logo, setLogo] = useState<Logo | null>(null);
  const [credits, setCredits] = useState(FREE_PREVIEWS);
  const [phase, setPhase] = useState<"edit" | "generating" | "result">("edit");
  const [results, setResults] = useState<Result[]>([]);
  const [active, setActive] = useState(0);
  const [modal, setModal] = useState<null | "signup" | "limit" | "report">(null);

  function defaults(p: Product): Config {
    return { colour: COLOURS[0].name, material: p.materials[0].name, finish: p.finishes[0].name, size: SIZES[1], placement: PLACEMENTS[0] };
  }

  const pick = (p: Product) => {
    setProduct(p);
    setConfig(defaults(p));
  };
  const set = (key: keyof Config, value: string) => setConfig((c) => ({ ...c, [key]: value }));

  const start = () => workspace.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const generate = () => {
    if (!logo) return setStep(2);
    if (credits <= 0) return setModal("limit");
    setPhase("generating");
  };

  const finishGeneration = () => {
    const r: Result = { id: Date.now(), image: sampleImage(product, config.finish), config: { ...config }, product };
    setResults((list) => [r, ...list]);
    setActive(0);
    setCredits((c) => c - 1);
    setPhase("result");
  };

  const current = results[active];
  const quoteHref = (r: Result) =>
    `/quote?product=${r.product.slug}&material=${encodeURIComponent(r.config.material)}&finish=${encodeURIComponent(r.config.finish)}&qty=500`;

  return (
    <>
      {/* S1 — Studio landing */}
      <section className="relative overflow-hidden bg-bg pb-14 pt-32 lg:pb-20 lg:pt-40">
        <div className="blob -left-40 top-10 size-[34rem] bg-brand/25" aria-hidden="true" />
        <div className="blob -right-32 top-40 size-[30rem] bg-gold/20" aria-hidden="true" />
        <div className="container-x relative text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }} className="flex items-center justify-center gap-2">
            <AiBadge className="text-xs" />
            <span className="eyebrow">AI Packaging Studio · Preview</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.08, ease: EASE }} className="display mx-auto mt-6 max-w-4xl text-[clamp(2.6rem,6.4vw,5.6rem)]">
            See it on your brand. <span className="text-gradient">Get it made.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.18, ease: EASE }} className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            Pick a real Heritage Shapes product, choose the finish, upload your logo, and get a photo-real mockup in under a minute. Then request a quote for exactly what you see.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.26, ease: EASE }} className="mt-9 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={start} className={buttonClass("brand")}>
              <Sparkles className="size-4" aria-hidden="true" /> Start designing
            </button>
            <a href="#examples" className={buttonClass("outline")}>
              View examples
            </a>
          </motion.div>
          <p className="mt-5 text-sm text-muted">No sign-up needed for your first {FREE_PREVIEWS} designs.</p>

          <ol className="mx-auto mt-14 grid max-w-4xl gap-4 text-left sm:grid-cols-3">
            {[
              { icon: LayoutGrid, t: "Choose", d: "A product we actually manufacture." },
              { icon: Wand2, t: "Customise", d: "Material, colour, finish and size." },
              { icon: Sparkles, t: "Visualise", d: "Your logo on it, then a quote." },
            ].map((s, i) => (
              <motion.li key={s.t} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 + i * 0.08, ease: EASE }} className="glass-btn flex items-start gap-4 rounded-3xl p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand">
                  <s.icon className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="eyebrow">0{i + 1}</span>
                  <span className="mt-1 block font-medium tracking-tight">{s.t}</span>
                  <span className="mt-0.5 block text-sm text-muted">{s.d}</span>
                </span>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* S2–S7 — Workspace */}
      <section ref={workspace} id="studio" className="scroll-mt-20 bg-bg2 py-12 lg:py-16">
        <div className="container-x">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Design studio</p>
              <h2 className="display mt-2 text-[clamp(1.7rem,3vw,2.6rem)]">{phase === "result" ? "Your design" : "Build your packaging"}</h2>
            </div>
            <CreditBadge credits={credits} />
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-line bg-surface shadow-[0_40px_120px_-60px_rgba(0,0,0,.35)]">
            <AnimatePresence mode="wait" initial={false}>
              {phase === "result" && current ? (
                <ResultView
                  key="result"
                  result={current}
                  history={results}
                  active={active}
                  logo={logo}
                  credits={credits}
                  quoteHref={quoteHref(current)}
                  onPick={setActive}
                  onRegenerate={generate}
                  onEdit={() => setPhase("edit")}
                  onNew={() => {
                    setPhase("edit");
                    setStep(0);
                  }}
                  onSignup={() => setModal("signup")}
                  onReport={() => setModal("report")}
                />
              ) : (
                <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid lg:grid-cols-[minmax(0,26rem)_1fr]">
                  {/* Left: steps */}
                  <div className="border-b border-line p-5 sm:p-7 lg:border-b-0 lg:border-r">
                    <Stepper step={step} setStep={setStep} logo={!!logo} />
                    <div className="mt-7 min-h-[26rem]">
                      <AnimatePresence mode="wait">
                        <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.35, ease: EASE }}>
                          {step === 0 && <ProductStep items={studioProducts} selected={product} onPick={pick} />}
                          {step === 1 && <CustomiseStep product={product} config={config} set={set} />}
                          {step === 2 && <LogoStep logo={logo} setLogo={setLogo} />}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-5">
                      <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className={buttonClass("ghost", "min-h-0 disabled:opacity-0")}>
                        <ArrowLeft className="size-4" aria-hidden="true" /> Back
                      </button>
                      {step < 2 ? (
                        <button type="button" onClick={() => setStep((s) => s + 1)} className={buttonClass("primary")}>
                          Continue <ArrowRight className="size-4" aria-hidden="true" />
                        </button>
                      ) : (
                        <button type="button" onClick={generate} disabled={!logo || phase === "generating"} className={buttonClass("brand", "disabled:opacity-50")}>
                          <Sparkles className="size-4" aria-hidden="true" /> Generate · 1 credit
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right: live canvas */}
                  <Canvas product={product} config={config} logo={logo} generating={phase === "generating"} onDone={finishGeneration} onCancel={() => setPhase("edit")} onGenerate={generate} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="mt-4 flex items-start gap-2 text-xs text-muted">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            Interface preview. AI generation is not connected yet, so results show a sample photo of the product and finish you chose. Your logo stays in your browser and is never uploaded.
          </p>
        </div>
      </section>

      {/* Examples + trust */}
      <section id="examples" className="scroll-mt-20 bg-bg py-14 lg:py-20">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Made with the Studio</p>
              <h2 className="display mt-3 text-[clamp(1.8rem,3.6vw,3rem)]">Real finishes. Real factory.</h2>
            </div>
            <Link href="/portfolio" className={buttonClass("outline")}>
              See the portfolio <Arrow />
            </Link>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { src: "/products/photo/shopping-bags-foil.webp", t: "Gold foil on matte black" },
              { src: "/products/photo/thank-you-cards-deboss.webp", t: "Deboss on sage board" },
              { src: "/products/photo/tote-bags-colour.webp", t: "Full-colour DTF tote" },
              { src: "/products/photo/shopping-bags-emboss.webp", t: "Blind emboss, white bag" },
            ].map((e) => (
              <li key={e.src} className="group">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-bg2">
                  <Image src={e.src} alt={e.t} fill sizes="(min-width: 1024px) 24vw, 46vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <p className="mt-2.5 text-sm font-medium">{e.t}</p>
              </li>
            ))}
          </ul>
          <ul className="mt-12 grid gap-4 border-t border-line pt-8 text-sm sm:grid-cols-3">
            {[
              { icon: ShieldCheck, t: "Only producible options", d: "Every choice is something our factory makes." },
              { icon: ImageUp, t: "Your logo stays private", d: "Used only to create your mockup." },
              { icon: Zap, t: "Mockup to quote in one click", d: "Your design pre-fills the quote form." },
            ].map((x) => (
              <li key={x.t} className="flex gap-3">
                <x.icon className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
                <span>
                  <span className="block font-medium">{x.t}</span>
                  <span className="text-muted">{x.d}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Modal open={modal !== null} onClose={() => setModal(null)}>
        {modal === "signup" && <SignupPrompt onClose={() => setModal(null)} />}
        {modal === "limit" && <LimitReached onClose={() => setModal(null)} quoteHref={current ? quoteHref(current) : "/quote"} />}
        {modal === "report" && <ReportIssue onClose={() => setModal(null)} />}
      </Modal>
    </>
  );
}

/* ------------------------------------------------------------------ parts */

function CreditBadge({ credits }: { credits: number }) {
  return (
    <span className="glass-btn inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-sm">
      <span className="flex gap-1" aria-hidden="true">
        {Array.from({ length: FREE_PREVIEWS }).map((_, i) => (
          <span key={i} className={cn("size-2 rounded-full transition-colors", i < credits ? "bg-brand" : "bg-line")} />
        ))}
      </span>
      <span>
        <b className="font-semibold tabular-nums">{credits}</b> of {FREE_PREVIEWS} free previews left
      </span>
    </span>
  );
}

function Stepper({ step, setStep, logo }: { step: number; setStep: (n: number) => void; logo: boolean }) {
  const steps = ["Product", "Customise", "Logo"];
  return (
    <ol className="grid grid-cols-3 gap-2">
      {steps.map((s, i) => {
        const done = i < step || (i === 2 && logo);
        return (
          <li key={s}>
            <button type="button" onClick={() => setStep(i)} aria-current={step === i ? "step" : undefined} className="group w-full text-left">
              <span className="block h-1 overflow-hidden rounded-full bg-line">
                <motion.span className="block h-full bg-brand" initial={false} animate={{ width: i <= step ? "100%" : "0%" }} transition={{ duration: 0.5, ease: EASE }} />
              </span>
              <span className={cn("mt-2.5 flex items-center gap-1.5 text-sm", step === i ? "text-ink" : "text-muted group-hover:text-ink")}>
                {done && i !== step ? <Check className="size-3.5 text-brand" aria-hidden="true" /> : <span className="tabular-nums">0{i + 1}</span>}
                {s}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function ProductStep({ items, selected, onPick }: { items: Product[]; selected: Product; onPick: (p: Product) => void }) {
  return (
    <div>
      <h3 className="text-xl font-medium tracking-tight">What are we designing?</h3>
      <p className="mt-1 text-sm text-muted">Only products our factory makes are available.</p>
      <ul className="mt-5 grid grid-cols-2 gap-3">
        {items.map((p) => {
          const on = p.slug === selected.slug;
          return (
            <li key={p.slug}>
              <button
                type="button"
                onClick={() => onPick(p)}
                aria-pressed={on}
                className={cn("group w-full overflow-hidden rounded-2xl border text-left transition-all", on ? "border-brand shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand)_18%,transparent)]" : "border-line hover:border-ink/40")}
              >
                <span className="relative block aspect-[4/3] bg-bg2">
                  <Image src={p.image} alt="" fill sizes="200px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  {on && (
                    <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-brand text-onbrand">
                      <Check className="size-3.5" aria-hidden="true" />
                    </span>
                  )}
                </span>
                <span className="block px-3 py-2.5">
                  <span className="block text-sm font-medium leading-tight">{p.name}</span>
                  <span className="block text-xs text-muted">{categoryName(p.category)}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Group({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="eyebrow mb-2.5 flex w-full items-center justify-between gap-2">
        {label}
        {hint && <span className="normal-case tracking-normal text-muted">{hint}</span>}
      </legend>
      {children}
    </fieldset>
  );
}

function CustomiseStep({ product, config, set }: { product: Product; config: Config; set: (k: keyof Config, v: string) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-medium tracking-tight">Customise your {product.name.toLowerCase()}</h3>
        <p className="mt-1 text-sm text-muted">The preview updates as you choose.</p>
      </div>
      <Group label="Colour" hint={config.colour}>
        <div className="flex flex-wrap gap-2.5">
          {COLOURS.map((c) => (
            <button
              key={c.name}
              type="button"
              title={c.name}
              aria-label={c.name}
              aria-pressed={config.colour === c.name}
              onClick={() => set("colour", c.name)}
              className={cn("size-9 rounded-full border border-black/10 transition-transform hover:scale-110", config.colour === c.name && "ring-2 ring-brand ring-offset-2 ring-offset-surface")}
              style={{ background: c.hex }}
            />
          ))}
        </div>
      </Group>
      <Group label="Material">
        <div className="flex flex-wrap gap-2">
          {product.materials.map((m) => (
            <button key={m.name} type="button" aria-pressed={config.material === m.name} onClick={() => set("material", m.name)} className={chip(config.material === m.name)}>
              {m.name}
            </button>
          ))}
        </div>
      </Group>
      <Group label={product.finishLabel ?? "Finish"}>
        <div className="flex flex-wrap gap-2">
          {product.finishes.map((f) => (
            <button key={f.name} type="button" aria-pressed={config.finish === f.name} onClick={() => set("finish", f.name)} className={chip(config.finish === f.name)}>
              {f.name}
            </button>
          ))}
        </div>
      </Group>
      <div className="grid gap-6 sm:grid-cols-2">
        <Group label="Size">
          <div className="flex flex-wrap gap-2">
            {SIZES.map((s) => (
              <button key={s} type="button" aria-pressed={config.size === s} onClick={() => set("size", s)} className={chip(config.size === s)}>
                {s}
              </button>
            ))}
          </div>
        </Group>
        <Group label="Logo placement">
          <select value={config.placement} onChange={(e) => set("placement", e.target.value)} className="glass-btn h-10 w-full rounded-full px-4 text-sm outline-none">
            {PLACEMENTS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </Group>
      </div>
    </div>
  );
}

function LogoStep({ logo, setLogo }: { logo: Logo | null; setLogo: (l: Logo | null) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [state, setState] = useState<"idle" | "processing" | "error">("idle");
  const [error, setError] = useState("");

  const read = (file: File) => {
    setError("");
    if (!/^image\/(png|jpeg|webp|svg\+xml)$/.test(file.type)) {
      setState("error");
      return setError("Use a PNG, JPG, WEBP or SVG file.");
    }
    if (file.size > 10 * 1024 * 1024) {
      setState("error");
      return setError("That file is over 10 MB. Try a smaller export.");
    }
    setState("processing");
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      // Check a corner pixel to tell a transparent logo from one on a solid background.
      let transparent = file.type === "image/svg+xml";
      try {
        const c = document.createElement("canvas");
        c.width = c.height = 4;
        const ctx = c.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, 4, 4);
          transparent = transparent || ctx.getImageData(0, 0, 1, 1).data[3] < 20;
        }
      } catch {}
      setTimeout(() => {
        setLogo({ url, name: file.name, width: img.naturalWidth || 1000, height: img.naturalHeight || 1000, transparent, kb: Math.round(file.size / 1024) });
        setState("idle");
      }, 650);
    };
    img.onerror = () => {
      setState("error");
      setError("We couldn't read that image. Try exporting it again.");
    };
    img.src = url;
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) read(f);
  };
  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) read(f);
    e.target.value = "";
  };

  const lowRes = logo && Math.max(logo.width, logo.height) < 500;

  return (
    <div>
      <h3 className="text-xl font-medium tracking-tight">Add your logo</h3>
      <p className="mt-1 text-sm text-muted">A transparent PNG or SVG gives the cleanest result.</p>

      {logo ? (
        <div className="mt-5">
          <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-2xl border border-line bg-[repeating-conic-gradient(rgba(120,130,138,.14)_0%_25%,transparent_0%_50%)] bg-[length:20px_20px] p-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo.url} alt="Your logo" className="max-h-full max-w-full object-contain" />
            <button type="button" onClick={() => setLogo(null)} aria-label="Remove logo" className="glass-btn absolute right-3 top-3 grid size-9 place-items-center rounded-full">
              <X className="size-4" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="truncate font-medium">{logo.name}</span>
            <span className="text-muted">
              {logo.width}×{logo.height}px · {logo.kb} KB
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone={lowRes ? "warn" : "good"}>{lowRes ? "Low resolution" : "Good resolution"}</Badge>
            <Badge tone={logo.transparent ? "good" : "warn"}>{logo.transparent ? "Transparent background" : "Has background"}</Badge>
          </div>
          {!logo.transparent && (
            <label className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3 text-sm">
              <span>
                Remove background
                <span className="block text-xs text-muted">Recommended for logos on white</span>
              </span>
              <input type="checkbox" defaultChecked className="size-4 accent-[var(--brand)]" />
            </label>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          className={cn(
            "mt-5 grid aspect-[4/3] place-items-center rounded-2xl border-2 border-dashed p-6 text-center transition-colors",
            drag ? "border-brand bg-brand/5" : "border-line",
            state === "error" && "border-gold",
          )}
        >
          {state === "processing" ? (
            <div className="flex flex-col items-center gap-3 text-sm text-muted">
              <span className="size-8 animate-spin rounded-full border-2 border-line border-t-brand" aria-hidden="true" />
              Preparing your logo…
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-brand/10 text-brand">
                <ImageUp className="size-6" aria-hidden="true" />
              </span>
              <p className="mt-4 font-medium">Drop your logo here</p>
              <p className="mt-1 text-sm text-muted">PNG, JPG, WEBP or SVG · up to 10 MB</p>
              <button type="button" onClick={() => input.current?.click()} className={buttonClass("outline", "mt-5 min-h-10 py-2")}>
                Choose file
              </button>
              {error && (
                <p role="alert" className="mt-4 flex items-center gap-1.5 text-sm text-gold">
                  <TriangleAlert className="size-4" aria-hidden="true" /> {error}
                </p>
              )}
            </div>
          )}
          <input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={onPick} className="sr-only" />
        </div>
      )}
      <p className="mt-4 flex items-start gap-2 text-xs text-muted">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-brand" aria-hidden="true" />
        Only upload logos you own or have permission to use.
      </p>
    </div>
  );
}

function Badge({ tone, children }: { tone: "good" | "warn"; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", tone === "good" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-gold/15 text-gold")}>
      {tone === "good" ? <Check className="size-3" aria-hidden="true" /> : <TriangleAlert className="size-3" aria-hidden="true" />}
      {children}
    </span>
  );
}

/** Right-hand live preview; turns into the generation progress screen (S5). */
function Canvas({ product, config, logo, generating, onDone, onCancel, onGenerate }: { product: Product; config: Config; logo: Logo | null; generating: boolean; onDone: () => void; onCancel: () => void; onGenerate: () => void }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!generating) return setStage(0);
    const timers = STAGES.map((_, i) => setTimeout(() => setStage(i), i * 1100));
    const done = setTimeout(onDone, STAGES.length * 1100 + 400);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [generating, onDone]);

  return (
    <div className="relative flex flex-col bg-bg2/60 p-5 sm:p-7">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-line bg-bg2 lg:aspect-auto lg:flex-1">
        <AnimatePresence initial={false}>
          <motion.div key={product.slug + config.finish} className="absolute inset-0" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: EASE }}>
            <Image src={sampleImage(product, config.finish)} alt={`${product.name} preview`} fill sizes="(min-width: 1024px) 55vw, 92vw" className={cn("object-cover transition-[filter] duration-700", generating && "blur-md saturate-50")} />
          </motion.div>
        </AnimatePresence>

        {/* Spec chips */}
        {!generating && (
          <div className="absolute inset-x-3 top-3 flex flex-wrap gap-1.5">
            {[product.name, config.colour, config.material, config.finish].map((t) => (
              <span key={t} className="glass rounded-full px-2.5 py-1 text-[0.7rem] font-medium">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Logo chip */}
        {!generating && (
          <div className="absolute bottom-3 left-3 flex items-center gap-2.5 rounded-2xl bg-white/85 p-2 pr-3.5 text-[#0e1418] shadow-lg backdrop-blur">
            <span className="grid size-10 place-items-center overflow-hidden rounded-xl bg-[repeating-conic-gradient(rgba(0,0,0,.06)_0%_25%,transparent_0%_50%)] bg-[length:10px_10px]">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo.url} alt="" className="max-h-8 max-w-8 object-contain" />
              ) : (
                <ImageUp className="size-4 opacity-50" aria-hidden="true" />
              )}
            </span>
            <span className="text-xs leading-tight">
              <span className="block font-medium">{logo ? "Your logo" : "No logo yet"}</span>
              <span className="text-black/55">{config.placement}</span>
            </span>
          </div>
        )}

        {/* S5 — generation progress */}
        <AnimatePresence>
          {generating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 grid place-items-center bg-black/30 p-6 text-white" role="status" aria-live="polite">
              <motion.div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent" animate={{ x: ["-100%", "300%"] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} aria-hidden="true" />
              <div className="relative w-full max-w-sm text-center">
                <span className="mx-auto grid size-16 place-items-center rounded-full bg-white/15 backdrop-blur">
                  <Sparkles className="size-7 animate-pulse" aria-hidden="true" />
                </span>
                <AnimatePresence mode="wait">
                  <motion.p key={stage} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-5 text-lg font-medium">
                    {STAGES[stage]}…
                  </motion.p>
                </AnimatePresence>
                <span className="mt-4 block h-1 overflow-hidden rounded-full bg-white/20">
                  <motion.span className="block h-full bg-white" initial={{ width: "4%" }} animate={{ width: `${((stage + 1) / STAGES.length) * 100}%` }} transition={{ duration: 1, ease: "easeOut" }} />
                </span>
                <p className="mt-3 text-sm text-white/75">Tip: foil and emboss look best on darker, matte stock.</p>
                <button type="button" onClick={onCancel} className="mt-5 text-sm underline underline-offset-4 opacity-80 hover:opacity-100">
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!generating && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">
            <b className="font-medium text-ink">{product.name}</b> · {config.size} · {config.placement}
          </p>
          <button type="button" onClick={onGenerate} className={buttonClass("brand", "lg:hidden")}>
            <Sparkles className="size-4" aria-hidden="true" /> Generate
          </button>
        </div>
      )}
    </div>
  );
}

/** S6/S7 — result with quote as the primary action. */
function ResultView({
  result,
  history,
  active,
  logo,
  credits,
  quoteHref,
  onPick,
  onRegenerate,
  onEdit,
  onNew,
  onSignup,
  onReport,
}: {
  result: Result;
  history: Result[];
  active: number;
  logo: Logo | null;
  credits: number;
  quoteHref: string;
  onPick: (i: number) => void;
  onRegenerate: () => void;
  onEdit: () => void;
  onNew: () => void;
  onSignup: () => void;
  onReport: () => void;
}) {
  const [zoom, setZoom] = useState(false);
  const [rating, setRating] = useState<null | "up" | "down">(null);
  const spec: [string, string][] = [
    ["Product", result.product.name],
    ["Colour", result.config.colour],
    ["Material", result.config.material],
    [result.product.finishLabel ?? "Finish", result.config.finish],
    ["Size", result.config.size],
    ["Logo placement", result.config.placement],
    ["Mode", "Quick preview"],
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid lg:grid-cols-[1.5fr_1fr]">
      <div className="border-b border-line p-5 sm:p-7 lg:border-b-0 lg:border-r">
        <button type="button" onClick={() => setZoom((z) => !z)} aria-label={zoom ? "Zoom out" : "Zoom in"} className="relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-[1.5rem] bg-bg2">
          <motion.div key={result.id} className="absolute inset-0" initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: zoom ? 1.6 : 1 }} transition={{ duration: 0.8, ease: EASE }}>
            <Image src={result.image} alt={`Sample ${result.product.name.toLowerCase()} in ${result.config.finish.toLowerCase()}`} fill priority sizes="(min-width: 1024px) 58vw, 92vw" className="object-cover" />
          </motion.div>
          <span className="glass absolute left-3 top-3 rounded-full px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.12em]">Sample image</span>
          <span className="pointer-events-none absolute inset-0 grid place-items-center text-4xl font-semibold uppercase tracking-[0.4em] text-white/20" aria-hidden="true">
            Preview
          </span>
          {logo && (
            <span className="absolute bottom-3 right-3 flex items-center gap-2 rounded-xl bg-white/85 p-1.5 pr-3 text-xs text-[#0e1418] backdrop-blur">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo.url} alt="" className="size-7 rounded-md object-contain" />
              Your logo goes here in the live Studio
            </span>
          )}
        </button>

        {history.length > 1 && (
          <div className="mt-4">
            <p className="eyebrow mb-2">This session</p>
            <div className="no-scrollbar flex gap-2 overflow-x-auto">
              {history.map((h, i) => (
                <button key={h.id} type="button" onClick={() => onPick(i)} aria-pressed={i === active} className={cn("relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-colors", i === active ? "border-brand" : "border-transparent opacity-70 hover:opacity-100")}>
                  <Image src={h.image} alt="" fill sizes="96px" className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col p-5 sm:p-7">
        <div className="flex items-center gap-2">
          <AiBadge />
          <span className="eyebrow">Your design is ready</span>
        </div>
        <h3 className="display mt-3 text-3xl">{result.product.name}</h3>

        <dl className="mt-5 divide-y divide-line rounded-2xl border border-line text-sm">
          {spec.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 px-4 py-2.5">
              <dt className="text-muted">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        <Link href={quoteHref} className={buttonClass("brand", "mt-6 w-full")}>
          Get a quote for this design <Arrow />
        </Link>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={onRegenerate} className={buttonClass("outline", "min-h-11 py-2")}>
            <RefreshCw className="size-4" aria-hidden="true" /> Regenerate
          </button>
          <button type="button" onClick={onEdit} className={buttonClass("outline", "min-h-11 py-2")}>
            <Pencil className="size-4" aria-hidden="true" /> Edit options
          </button>
          <button type="button" onClick={onSignup} className={buttonClass("outline", "min-h-11 py-2")}>
            <Download className="size-4" aria-hidden="true" /> Download
          </button>
          <button type="button" onClick={onSignup} className={buttonClass("outline", "min-h-11 py-2")}>
            <FolderPlus className="size-4" aria-hidden="true" /> Save
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-muted">
          Regenerate uses 1 credit · {credits} left
        </p>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-5 text-sm">
          <span className="flex items-center gap-1">
            <span className="mr-1 text-muted">Rate this result</span>
            <button type="button" onClick={() => setRating("up")} aria-pressed={rating === "up"} aria-label="Good result" className={cn("grid size-9 place-items-center rounded-full", rating === "up" ? "bg-brand text-onbrand" : "hover:bg-bg2")}>
              <ThumbsUp className="size-4" />
            </button>
            <button type="button" onClick={() => setRating("down")} aria-pressed={rating === "down"} aria-label="Poor result" className={cn("grid size-9 place-items-center rounded-full", rating === "down" ? "bg-ink text-bg" : "hover:bg-bg2")}>
              <ThumbsDown className="size-4" />
            </button>
          </span>
          <button type="button" onClick={onReport} className="link-underline text-muted hover:text-ink">
            Report an issue
          </button>
        </div>

        <p className="mt-5 rounded-2xl bg-bg2 p-4 text-xs leading-relaxed text-muted">AI preview for visualisation. Final colours, foil and sizes are confirmed with a physical proof before production.</p>

        <button type="button" onClick={onNew} className="link-underline mt-5 self-start text-sm font-medium">
          Start another design →
        </button>
      </div>
    </motion.div>
  );
}

/* ----------------------------------------------------------------- modals */

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[90] grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default bg-black/50" />
          <motion.div role="dialog" aria-modal="true" initial={{ y: 24, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 16, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }} className="relative w-full max-w-md rounded-[2rem] border border-line bg-surface p-7 shadow-2xl">
            <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid size-9 place-items-center rounded-full hover:bg-bg2">
              <X className="size-4" />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SignupPrompt({ onClose }: { onClose: () => void }) {
  return (
    <div>
      <AiBadge className="text-xs" />
      <h3 className="display mt-4 text-2xl">Save your work</h3>
      <p className="mt-2 text-sm text-muted">Create a free account to keep this design.</p>
      <ul className="mt-5 space-y-2 text-sm">
        {["Save designs to projects", "5 more free credits", "Full-size downloads"].map((b) => (
          <li key={b} className="flex items-center gap-2">
            <Check className="size-4 text-brand" aria-hidden="true" /> {b}
          </li>
        ))}
      </ul>
      <button type="button" className={buttonClass("outline", "mt-6 w-full")} disabled>
        Continue with Google
      </button>
      <input type="email" placeholder="you@brand.com" className="glass-btn mt-3 h-12 w-full rounded-full px-5 text-sm outline-none" />
      <button type="button" className={buttonClass("brand", "mt-3 w-full")} disabled>
        Create free account
      </button>
      <p className="mt-3 text-center text-xs text-muted">Accounts arrive with the live Studio.</p>
      <button type="button" onClick={onClose} className="link-underline mx-auto mt-4 block text-sm text-muted">
        Continue without an account
      </button>
    </div>
  );
}

function LimitReached({ onClose, quoteHref }: { onClose: () => void; quoteHref: string }) {
  return (
    <div>
      <span className="grid size-12 place-items-center rounded-2xl bg-gold/15 text-gold">
        <Sparkles className="size-5" aria-hidden="true" />
      </span>
      <h3 className="display mt-4 text-2xl">You&rsquo;ve used your free previews</h3>
      <p className="mt-2 text-sm text-muted">Create a free account for 5 more, or send us your design and get 10 bonus credits when you request a quote.</p>
      <div className="mt-6 grid gap-2">
        <Link href={quoteHref} onClick={onClose} className={buttonClass("brand", "w-full")}>
          Request a quote <Arrow />
        </Link>
        <button type="button" className={buttonClass("outline", "w-full")} disabled>
          Create a free account
        </button>
      </div>
    </div>
  );
}

function ReportIssue({ onClose }: { onClose: () => void }) {
  const [reason, setReason] = useState("");
  const [sent, setSent] = useState(false);
  if (sent)
    return (
      <div className="text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand/10 text-brand">
          <Check className="size-5" aria-hidden="true" />
        </span>
        <h3 className="display mt-4 text-2xl">Thanks for telling us</h3>
        <p className="mt-2 text-sm text-muted">Reports help us improve the Studio.</p>
        <button type="button" onClick={onClose} className={buttonClass("outline", "mt-6")}>
          Close
        </button>
      </div>
    );
  return (
    <div>
      <h3 className="display text-2xl">Report an issue</h3>
      <p className="mt-2 text-sm text-muted">What&rsquo;s wrong with this result?</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {["Logo distorted", "Wrong product", "Wrong colour", "Wrong finish", "Inappropriate", "Other"].map((r) => (
          <button key={r} type="button" aria-pressed={reason === r} onClick={() => setReason(r)} className={chip(reason === r)}>
            {r}
          </button>
        ))}
      </div>
      <textarea placeholder="Optional note" rows={3} className="mt-4 w-full rounded-2xl border border-line bg-transparent p-4 text-sm outline-none focus:border-ink" />
      <button type="button" disabled={!reason} onClick={() => setSent(true)} className={buttonClass("brand", "mt-4 w-full disabled:opacity-50")}>
        Send report
      </button>
    </div>
  );
}
