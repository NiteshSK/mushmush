import React from "react";
import { render, screen } from "@testing-library/react";
import ContactForm from "./ContactForm";

describe("ContactForm subject from the link", () => {
  afterEach(() => window.history.replaceState(null, "", "/"));

  it("pre-fills the subject from ?subject=", () => {
    window.history.replaceState(null, "", "/contact?subject=Next%20batch%3A%20Oyster%20Mushroom%20Training");
    render(<ContactForm />);
    expect(screen.getByRole("textbox", { name: /Subject/ })).toHaveValue("Next batch: Oyster Mushroom Training");
  });

  it("leaves the subject empty without the parameter", () => {
    window.history.replaceState(null, "", "/contact");
    render(<ContactForm />);
    expect(screen.getByRole("textbox", { name: /Subject/ })).toHaveValue("");
  });
});
