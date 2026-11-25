import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ProductForm from "../ProductForm";

const push = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const response = (body: unknown, status = 200) =>
  Promise.resolve({ ok: status < 400, json: () => Promise.resolve(body) } as Response);
const categories = [{ id: 1, title: "Spices" }];
const product = {
  id: 7, title: "Cumin", slug: "cumin", updatedAt: "2026-11-25T10:10:00Z", price: 99,
  quantity: 1000, measurementValue: 100, measurementType: "g", fulfillmentClass: "national",
  description: "A <strong>whole spice</strong>.",
  categories: [{ categoryId: 1 }],
  imgs: { previews: ["/large.png"], thumbnails: ["/small.png"] },
  additionalInfo: [{ label: "Storage", value: "Cool and dry." }],
  specifications: ["<strong>Variety:</strong> Whole cumin"],
  howToConsume: ["Use in tempering."],
  benefits: { flavour: "Warm and nutty" },
};

function serve(initial?: typeof product, save = () => response({ id: 40, title: "New spice", slug: "new-spice" }, 201)) {
  push.mockClear();
  const fetcher = jest.fn((url: string, options?: RequestInit) =>
    options?.method ? save() : response(url.startsWith("/api/categories") ? categories : initial));
  global.fetch = fetcher as unknown as typeof fetch;
  render(<ProductForm id={initial ? String(initial.id) : undefined} />);
  return fetcher;
}
const change = (name: string, value: string) =>
  fireEvent.change(screen.getByLabelText(name, { exact: true }), { target: { value } });

it("creates a decimal-priced product and sends staff to its opening-stock handoff", async () => {
  const fetcher = serve();
  await screen.findByLabelText("Product name");
  change("Product name", "New spice");
  change("Price per pack (₹)", "149.50");
  change("Pack amount", "250");
  change("Delivery", "national");
  change("Description", "Ground for cooking.");
  fireEvent.click(screen.getByRole("checkbox", { name: "Spices" }));
  fireEvent.click(screen.getByRole("button", { name: "Create product" }));
  expect(await screen.findByRole("heading", { name: "Product added" })).toBeTruthy();
  expect(screen.getByRole("link", { name: "Record opening stock" }).getAttribute("href")).toBe("/admin/inventory?q=New%20spice&receive=40");
  const saved = JSON.parse(fetcher.mock.calls.find(([, options]) => options?.method === "POST")![1]!.body as string);
  expect(saved).toMatchObject({ price: 149.5, measurementValue: 250, measurementType: "gm", fulfillmentClass: "national", categories: [1] });
  expect(saved).not.toHaveProperty("quantity");
  expect(saved).not.toHaveProperty("inStock");
});

it("keeps legacy pack units and leaves original image variants alone on a metadata edit", async () => {
  const fetcher = serve(product);
  await screen.findByLabelText("Product name");
  expect((screen.getByLabelText("Pack unit") as HTMLSelectElement).value).toBe("g");
  change("Product name", "Whole cumin");
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  await waitFor(() => expect(push).toHaveBeenCalledWith("/admin/products"));
  const saved = JSON.parse(fetcher.mock.calls.find(([, options]) => options?.method === "PUT")![1]!.body as string);
  expect(saved).toMatchObject({
    title: "Whole cumin", description: product.description, expectedUpdatedAt: product.updatedAt,
    additionalInfo: product.additionalInfo, howToConsume: product.howToConsume,
    specifications: product.specifications, benefits: product.benefits,
  });
  expect(saved).not.toHaveProperty("imgs");
  expect(saved).not.toHaveProperty("slug");
});

it("preserves the filled form when the server rejects a duplicate", async () => {
  const duplicate = "That name is already used in a shop link.";
  serve(product, () => response({ error: duplicate }, 409));
  await screen.findByLabelText("Product name");
  change("Product name", "Whole cumin");
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  const error = await screen.findByRole("alert");
  expect(error.textContent).toBe(duplicate);
  expect(document.activeElement).toBe(error);
  expect((screen.getByLabelText("Product name") as HTMLInputElement).value).toBe("Whole cumin");
  expect(push).not.toHaveBeenCalled();
});
