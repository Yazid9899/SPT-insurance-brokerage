import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CaseForm } from "@/components/cases/case-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("CaseForm open cover behavior", () => {
  it("renders cover type selector and insurer rate field", () => {
    render(<CaseForm />);

    expect(screen.getByText("Cover Type")).toBeInTheDocument();
    expect(screen.getByText("Insurer Rate (%)")).toBeInTheDocument();
  });
});
