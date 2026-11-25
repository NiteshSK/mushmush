import { render, screen } from "@testing-library/react";
import PantryLoader from "./PantryLoader";

describe("PantryLoader", () => {
  it("announces what is loading and hides the drawing from screen readers", () => {
    render(<PantryLoader />);
    expect(screen.getByRole("status").textContent).toBe("Opening the pantry…");
    expect(document.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("accepts its own words", () => {
    render(<PantryLoader label="Loading your orders…" variant="inline" />);
    expect(screen.getByRole("status").textContent).toBe("Loading your orders…");
  });
});
