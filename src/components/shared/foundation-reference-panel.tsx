import { CASE_LIFECYCLE, CARGO_SUB_PRODUCTS, PRODUCT_LINES } from "@/lib/constants";

export function FoundationReferencePanel() {
  return (
    <section className="grid gap-4 rounded border bg-white p-4 md:grid-cols-3">
      <div>
        <h3 className="font-semibold">Product Lines</h3>
        <ul className="mt-2 text-sm">
          {PRODUCT_LINES.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold">Cargo Sub-Products</h3>
        <ul className="mt-2 text-sm">
          {CARGO_SUB_PRODUCTS.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold">Case Lifecycle</h3>
        <ul className="mt-2 text-sm">
          {CASE_LIFECYCLE.map((status) => (
            <li key={status}>{status}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
