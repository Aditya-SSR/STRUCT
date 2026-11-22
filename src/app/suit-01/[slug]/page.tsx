import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRODUCTS, getProduct } from "@/data/products";
import ProductDetail from "@/components/shop/ProductDetail";
import OtherThree from "@/components/shop/OtherThree";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return { title: "Not found" };
  return {
    title: p.title,
    description: `${p.title}. ${p.blurb} $${p.price.usd.toLocaleString("en-US")} · ¥${p.price.jpy.toLocaleString("en-US")}, sold whole, ${p.units.remaining} of ${p.units.total} left. A fictional brand — nothing ships.`,
    openGraph: { title: `${p.title} — STRUCT`, images: [{ url: `/img/${p.images[0]}.webp`, width: 1024, height: 1024 }] },
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  return (
    <div>
      <ProductDetail product={product} />
      <OtherThree currentSlug={product.slug} />
    </div>
  );
}
