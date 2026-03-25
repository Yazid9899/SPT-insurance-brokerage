import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppSidebar } from "@/components/layout/app-sidebar";

describe("AppSidebar", () => {
  it("renders branding and user identity", () => {
    render(<AppSidebar user={{ name: "Case Maker", email: "casemaker@cargoshield.local" }} />);

    expect(screen.getByText("CargoShield")).toBeInTheDocument();
    expect(screen.getByText("Case Maker")).toBeInTheDocument();
    expect(screen.getByText("casemaker@cargoshield.local")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
  });
});
