import { describe, expect, it } from "vitest";

import { APP_NAME, NAV_ITEMS } from "@/lib/constants";

describe("bootstrap route contract", () => {
  it("contains shell metadata", () => {
    expect(APP_NAME).toBe("CargoShield");
    expect(NAV_ITEMS).toHaveLength(6);
  });
});
