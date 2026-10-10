import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brandKits, getKit, site } from "@/data/site";
import { KitDetail } from "@/sections/KitDetail";

type Props = { params: Promise<{ id: string }> };

export const generateStaticParams = () => brandKits.map((k) => ({ id: k.id }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const kit = getKit((await params).id);
  if (!kit) return {};
  return {
    title: `${kit.title} kit`,
    description: kit.text,
    alternates: { canonical: `/kits/${kit.id}` },
    openGraph: { title: `${kit.title} kit | ${site.name}`, description: kit.text, images: [kit.image] },
  };
}

export default async function KitPage({ params }: Props) {
  const kit = getKit((await params).id);
  if (!kit) notFound();
  return <KitDetail kit={kit} />;
}
