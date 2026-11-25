import { type DeliveryScope, deliveryScope } from "./catalogue";

/** Initial coverage for legacy quotes and a new store. The server's configured PIN list takes precedence. */
export const FRESH_DELIVERY_ZONE = "Local Dehradun";
export const FRESH_DELIVERY_PINS: readonly string[] = ["248001", "248142"];

/** The fields of a `/api/shipping/check` response that the rule reads. */
export type ShippingZone = { deliverable: boolean; zoneName?: string; freshEligible?: boolean };

/**
 * - `fresh`: fresh mushrooms and pantry goods deliver here.
 * - `confirm-fresh`: pantry goods deliver here; the farm must confirm fresh delivery.
 * - `pantry`: pantry goods deliver here; fresh mushrooms do not.
 * - `unavailable`: nothing delivers here.
 */
export type PinDelivery = "fresh" | "confirm-fresh" | "pantry" | "unavailable";

export function pinDelivery(pin: string, zone: ShippingZone): PinDelivery {
  if (!zone.deliverable) return "unavailable";
  if (zone.freshEligible === true) return "fresh";
  if (zone.freshEligible === false) return zone.zoneName === FRESH_DELIVERY_ZONE ? "confirm-fresh" : "pantry";
  if (zone.zoneName !== FRESH_DELIVERY_ZONE) return "pantry";
  return FRESH_DELIVERY_PINS.includes(pin) ? "fresh" : "confirm-fresh";
}

export const deliversFresh = (pin: string, zone: ShippingZone) => pinDelivery(pin, zone) === "fresh";

type Classifiable = Parameters<typeof deliveryScope>[0] & { id: number };

/**
 * Delivery scope of each bag line. Bag lines carry no category, so the scope comes from
 * the catalogue product with the same id. A line whose product is not in the catalogue
 * has no scope (undefined).
 */
export function lineScopes<L extends { id: number }>(lines: L[], catalogue: Classifiable[]): Map<number, DeliveryScope | undefined> {
  const products = new Map(catalogue.map(product => [product.id, product] as const));
  return new Map(lines.map(line => {
    const product = products.get(line.id);
    return [line.id, product ? deliveryScope(product) : undefined] as const;
  }));
}

/** Fresh lines that cannot go to this PIN. Empty when the PIN takes fresh delivery. */
export function undeliverableFreshLines<L extends { id: number }>(lines: L[], scopes: Map<number, DeliveryScope | undefined>, delivery: PinDelivery): L[] {
  if (delivery === "fresh") return [];
  return lines.filter(line => scopes.get(line.id) === "fresh");
}
