import type { Metadata } from "next";
import DropHero from "@/components/drop/DropHero";
import GarmentGrid from "@/components/drop/GarmentGrid";
import SuitBand from "@/components/drop/SuitBand";

export const metadata: Metadata = {
  title: "DROP-01",
  description:
    "DROP-01: eight garments, 100 units each, released once and never restocked. OBJ.01 to OBJ.08, sold individually. A fictional brand — nothing ships.",
};

export default function Drop01Page() {
  return (
    <div>
      <DropHero />
      <GarmentGrid />
      <SuitBand />
    </div>
  );
}
