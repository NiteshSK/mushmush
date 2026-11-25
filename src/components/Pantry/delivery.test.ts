import { deliversFresh, lineScopes, pinDelivery, undeliverableFreshLines } from "./delivery";

const product = (id: number, title: string, slugs: string[]) => ({
  id, title, measurementValue: 100, measurementType: "gm",
  categories: slugs.map(slug => ({ category: { slug } })),
});
const catalogue = [
  product(14, "King Oyster (Eryngii)", ["edible"]),
  product(50, "Cumin Seeds", ["spices"]),
  product(15, "Dried Turkey Tail Mushroom", ["medicinal", "powders"]),
  product(2, "Oyster Mushroom", ["edible"]),
];

describe("pinDelivery", () => {
  it("confirms fresh delivery only for the listed Dehradun PINs", () => {
    expect(pinDelivery("248001", { deliverable: true, zoneName: "Local Dehradun" })).toBe("fresh");
    expect(pinDelivery("248142", { deliverable: true, zoneName: "Local Dehradun" })).toBe("fresh");
    expect(deliversFresh("248001", { deliverable: true, zoneName: "Local Dehradun" })).toBe(true);
  });

  it("asks the farm to confirm other PINs in the broad Dehradun zone", () => {
    expect(pinDelivery("248171", { deliverable: true, zoneName: "Local Dehradun" })).toBe("confirm-fresh");
    expect(deliversFresh("248171", { deliverable: true, zoneName: "Local Dehradun" })).toBe(false);
  });

  it("ships only pantry goods elsewhere and nothing to undeliverable PINs", () => {
    expect(pinDelivery("110001", { deliverable: true, zoneName: "Delhi NCR" })).toBe("pantry");
    // A listed PIN outside the Dehradun zone is not fresh-eligible.
    expect(pinDelivery("248001", { deliverable: true, zoneName: "Delhi NCR" })).toBe("pantry");
    expect(pinDelivery("999999", { deliverable: false })).toBe("unavailable");
  });

  it("follows the server's freshEligible answer when the shipping check sends one", () => {
    expect(pinDelivery("248171", { deliverable: true, zoneName: "Local Dehradun", freshEligible: true })).toBe("fresh");
    expect(pinDelivery("248001", { deliverable: true, zoneName: "Local Dehradun", freshEligible: false })).toBe("confirm-fresh");
    expect(pinDelivery("110001", { deliverable: true, zoneName: "Delhi NCR", freshEligible: false })).toBe("pantry");
  });
});

describe("bag lines", () => {
  const bag = [{ id: 14, quantity: 1 }, { id: 50, quantity: 2 }, { id: 15, quantity: 1 }, { id: 99, quantity: 1 }];
  const scopes = lineScopes(bag, catalogue);

  it("classifies each line from the catalogue product with the same id", () => {
    expect(scopes.get(14)).toBe("fresh");
    expect(scopes.get(50)).toBe("national");
    expect(scopes.get(15)).toBe("national");
    expect(scopes.get(99)).toBeUndefined();
  });

  it("names only the fresh lines when the PIN cannot take fresh delivery", () => {
    expect(undeliverableFreshLines(bag, scopes, "pantry")).toEqual([{ id: 14, quantity: 1 }]);
    expect(undeliverableFreshLines(bag, scopes, "confirm-fresh")).toEqual([{ id: 14, quantity: 1 }]);
    expect(undeliverableFreshLines(bag, scopes, "fresh")).toEqual([]);
    const twoFresh = [...bag, { id: 2, quantity: 3 }];
    expect(undeliverableFreshLines(twoFresh, lineScopes(twoFresh, catalogue), "pantry").map(line => line.id)).toEqual([14, 2]);
  });
});
