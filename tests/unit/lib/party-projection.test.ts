import { describe, expect, it } from "vitest";

import { projectCaseParty } from "@/lib/party-projection";

describe("party-projection", () => {
  it("prefers normalized values when party references exist", () => {
    const projected = projectCaseParty({
      client: {
        id: "client-1",
        displayName: "Normalized Client",
        company: "Normalized Co",
        email: "client@example.com",
        phone: "08123",
        status: "ACTIVE",
      },
      insurer: {
        id: "insurer-1",
        displayName: "Normalized Insurer",
        company: null,
        email: null,
        phone: null,
        status: "ACTIVE",
      },
      clientName: "Legacy Client",
      clientCompany: "Legacy Co",
      clientEmail: null,
      clientPhone: null,
      insurerName: "Legacy Insurer",
    });

    expect(projected.source).toBe("normalized");
    expect(projected.clientName).toBe("Normalized Client");
    expect(projected.insurerName).toBe("Normalized Insurer");
  });

  it("falls back to snapshot values when normalized references are absent", () => {
    const projected = projectCaseParty({
      client: null,
      insurer: null,
      clientName: "Legacy Client",
      clientCompany: "Legacy Co",
      clientEmail: "legacy@example.com",
      clientPhone: "08000",
      insurerName: "Legacy Insurer",
    });

    expect(projected.source).toBe("snapshot");
    expect(projected.clientName).toBe("Legacy Client");
    expect(projected.insurerName).toBe("Legacy Insurer");
  });
});

