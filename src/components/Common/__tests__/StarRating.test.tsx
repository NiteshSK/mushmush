import React from "react";
import { render, screen } from "@testing-library/react";
import StarRating from "../StarRating";

describe("StarRating", () => {
  it("renders 5 star SVGs", () => {
    const { container } = render(<StarRating rating={3} />);
    const stars = container.querySelectorAll("svg");
    expect(stars).toHaveLength(5);
  });

  it("fills correct number of stars for integer rating", () => {
    const { container } = render(<StarRating rating={4} />);
    const paths = container.querySelectorAll("path");
    const filled = Array.from(paths).filter(
      (p) => p.getAttribute("fill") === "#F59E0B"
    );
    expect(filled).toHaveLength(4);
  });

  it("shows no filled stars for rating 0", () => {
    const { container } = render(<StarRating rating={0} />);
    const paths = container.querySelectorAll("path");
    const filled = Array.from(paths).filter(
      (p) => p.getAttribute("fill") === "#F59E0B"
    );
    expect(filled).toHaveLength(0);
  });

  it("fills all stars for rating 5", () => {
    const { container } = render(<StarRating rating={5} />);
    const paths = container.querySelectorAll("path");
    const filled = Array.from(paths).filter(
      (p) => p.getAttribute("fill") === "#F59E0B"
    );
    expect(filled).toHaveLength(5);
  });

  it("displays count when provided", () => {
    render(<StarRating rating={3} count={42} />);
    expect(screen.getByText("(42)")).toBeInTheDocument();
  });

  it("does not display count when not provided", () => {
    const { container } = render(<StarRating rating={3} />);
    expect(container.textContent).not.toContain("(");
  });

  it("respects size prop", () => {
    const { container } = render(<StarRating rating={1} size={20} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("20");
    expect(svg?.getAttribute("height")).toBe("20");
  });

  it("handles half-star ratings with gradient", () => {
    const { container } = render(<StarRating rating={3.5} />);
    const gradients = container.querySelectorAll("linearGradient");
    expect(gradients.length).toBeGreaterThan(0);
  });
});
