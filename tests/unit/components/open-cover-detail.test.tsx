import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OpenCoverDetail } from "@/components/open-covers/open-cover-detail";

describe("OpenCoverDetail", () => {
  it("renders declarations and detail metadata", () => {
    render(
      <OpenCoverDetail
        agreement={{
          id: "oc-1",
          reference: "OC-2026-001",
          clientName: "Client A",
          clientCompany: "Company A",
          cargoProduct: "CPO",
          insurerName: "Insurer A",
          insurerRate: "0.150000",
          effectiveFrom: "2026-01-01T00:00:00.000Z",
          effectiveTo: "2026-12-31T00:00:00.000Z",
          status: "ACTIVE",
          declarationCount: 1,
          transportMode: "MARINE",
          currency: "USD",
          notes: null,
        }}
        declarations={[
          {
            id: "case-1",
            caseNumber: "BRK-2026-0001",
            status: "DRAFT",
            productLine: "CARGO",
            coverType: "OPEN_COVER",
            clientName: "Client A",
            clientCompany: "Company A",
            currency: "USD",
            clientRate: "0.250000",
            insurerRate: "0.150000",
            clientPremium: "250.00",
            insurerPremium: "150.00",
            brokerCommission: "100.00",
            createdAt: "2026-02-01T00:00:00.000Z",
            openCoverId: "oc-1",
          },
        ]}
      />,
    );

    expect(screen.getByText("Open Cover OC-2026-001")).toBeInTheDocument();
    expect(screen.getByText("Declarations")).toBeInTheDocument();
    expect(screen.getByText("BRK-2026-0001")).toBeInTheDocument();
  });
});
