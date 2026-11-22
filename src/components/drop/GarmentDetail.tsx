"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Garment } from "@/data/drop";
import GarmentGallery from "./GarmentGallery";
import GarmentInfo from "./GarmentInfo";
import StickyBuy from "./StickyBuy";
import { useAddGarment } from "./useAddGarment";

/** Owns the size choice shared by the info panel and the mobile bar. */
export default function GarmentDetail({ garment }: { garment: Garment }) {
  const section = useRef<HTMLElement>(null);
  const addWrap = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [size, setSize] = useState<string | null>(null);
  // a message belongs to the size it was raised for: picking another size dismisses it
  const [msg, setMsg] = useState<{ text: string; size: string | null }>({ text: "", size: null });
  const [added, setAdded] = useState(false);
  const [inSection, setInSection] = useState(false);
  const [addInView, setAddInView] = useState(false);
  const add = useAddGarment();

  const submit = useCallback(() => {
    if (!size) {
      setMsg({ text: "SELECT A SIZE FIRST.", size });
      document.getElementById("size-select")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const r = add(garment, size);
    if (r === "limit") {
      setMsg({ text: "LIMIT 2 PER SIZE. IT IS ALREADY IN YOUR BAG.", size });
      return;
    }
    if (r === "added") {
      setMsg({ text: "", size });
      setAdded(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setAdded(false), 2200);
    }
  }, [add, garment, size]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

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
          <GarmentGallery garment={garment} />
        </div>
        <aside aria-label={`${garment.name} — details`} className="min-w-0 md:col-span-5">
          <div
            className="md:sticky md:top-[calc(var(--header-h)+24px)] md:max-h-[calc(100svh-var(--header-h)-48px)] md:overflow-y-auto md:pr-1"
            data-lenis-prevent
          >
            <GarmentInfo
              garment={garment}
              size={size}
              onSize={setSize}
              onAdd={submit}
              added={added}
              message={msg.size === size ? msg.text : ""}
              addWrapRef={addWrap}
            />
          </div>
        </aside>
      </div>
      <StickyBuy garment={garment} size={size} visible={inSection && !addInView} added={added} onAdd={submit} />
    </section>
  );
}
