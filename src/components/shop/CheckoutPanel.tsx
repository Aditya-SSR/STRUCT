"use client";
import type { FormEvent } from "react";
import Button from "@/components/ui/Button";
import SplitReveal from "@/components/ui/SplitReveal";

const FIELDS = [
  { id: "co-name", label: "FULL NAME", type: "text", auto: "off", ph: "Ren Example" },
  { id: "co-email", label: "EMAIL", type: "email", auto: "off", ph: "name@example.com" },
  { id: "co-address", label: "ADDRESS", type: "text", auto: "off", ph: "1-2-3 Kiba, Kōtō-ku" },
  { id: "co-city", label: "CITY / POSTCODE", type: "text", auto: "off", ph: "Tokyo 135-0042" },
];

type Props = {
  usd: number;
  jpy: number;
  onBack: () => void;
  onPlace: () => void;
};

/** The fictional checkout step. Inputs are decorative: nothing is validated, stored or sent. */
export default function CheckoutPanel({ usd, jpy, onBack, onPlace }: Props) {
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onPlace();
  };
  return (
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col" noValidate>
      <div data-modal-scroll data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto px-[var(--margin)] py-6 md:px-8">
        <div role="note" className="border border-signal p-4">
          <SplitReveal as="p" when="mount" speed={1.4} head={false} className="t-h3 text-[0.95rem]">
            STRUCT IS A FICTIONAL BRAND.
          </SplitReveal>
          <p className="t-label mt-3 text-paper">NO PAYMENT IS TAKEN. NOTHING SHIPS. DO NOT ENTER REAL DETAILS.</p>
        </div>

        <div className="mt-8 space-y-6">
          {FIELDS.map((f) => (
            <div key={f.id}>
              <label htmlFor={f.id} className="t-label text-ash">
                {f.label}
              </label>
              <input
                id={f.id}
                name={f.id}
                type={f.type}
                autoComplete={f.auto}
                placeholder={f.ph}
                className="mt-2 w-full border-b hairline bg-transparent py-3 font-mono text-sm text-paper outline-offset-4 placeholder:text-smoke focus:border-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
              />
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-baseline justify-between border-t hairline pt-5">
          <span className="t-label">TOTAL</span>
          <span className="t-dots text-xl">
            ${usd.toLocaleString("en-US")} · ¥{jpy.toLocaleString("en-US")}
          </span>
        </div>
      </div>
      <div className="flex gap-3 border-t hairline px-[var(--margin)] py-4 md:px-8">
        <Button type="button" tone="paper" variant="line" arrow={false} onClick={onBack} data-cursor="BACK">
          BACK
        </Button>
        <Button type="submit" tone="paper" variant="solid" className="flex-1" data-cursor="PLACE">
          PLACE ORDER
        </Button>
      </div>
    </form>
  );
}
