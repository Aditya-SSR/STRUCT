import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GARMENTS, getGarment } from "@/data/drop";
import GarmentDetail from "@/components/drop/GarmentDetail";
import MoreFromDrop from "@/components/drop/MoreFromDrop";
import SuitBand from "@/components/drop/SuitBand";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return GARMENTS.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const g = getGarment(slug);
  if (!g) return { title: "Not found" };
  return {
    title: `${g.name} — ${g.sku}`,
    description: `${g.name}. ${g.blurb} $${g.price.usd.toLocaleString("en-US")} · ¥${g.price.jpy.toLocaleString("en-US")}, ${g.units.remaining} of ${g.units.total} left. DROP-01, never restocked. A fictional brand — nothing ships.`,
    openGraph: { title: `${g.name} — STRUCT`, images: [{ url: `/img/${g.images[0]}.webp`, width: 2400, height: 1309 }] },
  };
}

export default async function GarmentPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const garment = getGarment(slug);
  if (!garment) notFound();
  return (
    <div>
      <GarmentDetail garment={garment} />
      <MoreFromDrop currentSlug={garment.slug} />
      <SuitBand />
    </div>
  );
}
