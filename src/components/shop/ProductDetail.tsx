"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@/data/products";
import Gallery from "./Gallery";
import ProductInfo from "./ProductInfo";
import StickyBar from "./StickyBar";
import { useAddToBag } from "./useAddToBag";

/** Owns the size choice shared by the info panel and the mobile bar. */
export default function ProductDetail({ product }: { product: Product }) {
  const section = useRef<HTMLElement>(null);
  const addWrap = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<string | null>(null);
  const [inSection, setInSection] = useState(false);
  const [addInView, setAddInView] = useState(false);

  const needSize = useCallback(() => {
    document.getElementById("size-select")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);
  const { state, message, submit } = useAddToBag(product, size, needSize);

  // mobile bar: shown while the product section is on screen and the in-flow button is not
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const a = new IntersectionObserver(([e]) => setInSection(e.isIntersecting), { rootMargin: "0px 0px -80px 0px" });
    const b = new IntersectionObserver(([e]) => setAddInView(e.isIntersecting));
    if (section.current) a.observe(section.current);
    if (addWrap.current) b.observe(addWrap.current);
    return () => {
      a.disconnect();
      b.disconnect();
    };
  }, []);

  return (
    <section
      ref={section}
      data-header-tone="light"
      className="tone-blanc pad-x pb-16 pt-[calc(var(--header-h)+20px)] md:pb-28 md:pt-[calc(var(--header-h)+32px)]"
    >
      <div className="grid grid-cols-[minmax(0,1fr)] gap-10 md:grid-cols-12 md:gap-x-8">
        <div className="min-w-0 md:col-span-7">
          <Gallery product={product} />
        </div>
        <aside aria-label={`${product.title} — details`} className="min-w-0 md:col-span-5">
          <div
            className="md:sticky md:top-[calc(var(--header-h)+24px)] md:max-h-[calc(100svh-var(--header-h)-48px)] md:overflow-y-auto md:pr-1"
            data-lenis-prevent
          >
            <ProductInfo
              product={product}
              size={size}
              onSize={setSize}
              onAdd={submit}
              addState={state}
              message={message}
              addWrapRef={addWrap}
            />
          </div>
        </aside>
      </div>
      <StickyBar product={product} size={size} visible={inSection && !addInView} addState={state} onAdd={submit} />
    </section>
  );
}
