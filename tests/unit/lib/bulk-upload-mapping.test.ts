import { describe, expect, it } from "vitest";

import { autoMapHeaders } from "@/lib/bulk-upload/mapping";

describe("bulk upload header mapping", () => {
  it("maps deterministic aliases automatically", () => {
    const result = autoMapHeaders(["Origin", "Destination", "Vessel/Fleet", "Quantity (MT)", "Sum Insured", "ETD"]);
    const mappedFields = result.mappings.map((m) => m.targetField);
    expect(mappedFields).toContain("origin");
    expect(mappedFields).toContain("destination");
    expect(result.unresolvedRequiredFields.length).toBeLessThanOrEqual(1);
  });

  it("keeps required field unresolved on ambiguity", () => {
    const result = autoMapHeaders(["Origin", "From", "Destination", "Vessel", "Quantity", "Sum Insured", "ETD"]);
    expect(result.unresolvedRequiredFields).toContain("origin");
  });
});
