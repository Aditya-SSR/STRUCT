import type { Metadata } from "next";
import SuitHero from "@/components/shop/SuitHero";
import ProductGrid from "@/components/shop/ProductGrid";
import SoldWholeBand from "@/components/shop/SoldWholeBand";
import DropLinkBand from "@/components/shop/DropLinkBand";

export const metadata: Metadata = {
  title: "SUIT-01",
  description:
    "SUIT-01: a whole-body bundle (coat, tunic, trouser and belt) sold whole, never in parts. 400 units across four SKUs, never restocked. A fictional brand — nothing ships.",
};

export default function Suit01Page() {
  return (
    <div>
      <SuitHero />
      <ProductGrid />
      <SoldWholeBand />
      <DropLinkBand />
    </div>
  );
}
