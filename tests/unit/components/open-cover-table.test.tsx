import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OpenCoverTable } from "@/components/open-covers/open-cover-table";

describe("OpenCoverTable", () => {
  it("renders all required columns", () => {
    render(
      <OpenCoverTable
        rows={[
          {
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
            declarationCount: 3,
          },
        ]}
      />,
    );

    expect(screen.getByText("Reference")).toBeInTheDocument();
    expect(screen.getByText("Client")).toBeInTheDocument();
    expect(screen.getByText("Cargo Product")).toBeInTheDocument();
    expect(screen.getByText("Insurer")).toBeInTheDocument();
    expect(screen.getByText("Insurer Rate")).toBeInTheDocument();
    expect(screen.getByText("Effective Period")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Declarations")).toBeInTheDocument();
  });
});
