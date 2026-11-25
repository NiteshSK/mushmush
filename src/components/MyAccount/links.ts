export type AccountPath = "/account" | "/my-account" | "/orders" | "/addresses" | "/wishlist" | "/recently-viewed";

/** Secondary navigation shared by every account page. /my-account shows the same overview as /account. */
export const ACCOUNT_LINKS: { href: AccountPath; label: string }[] = [
  { href: "/account", label: "Overview" },
  { href: "/orders", label: "Orders" },
  { href: "/addresses", label: "Addresses" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/recently-viewed", label: "Recently viewed" },
];

/** Sign-in link that brings the shopper back to this account page afterwards. */
export const signInHref = (path: AccountPath) => `/auth/signin?callbackUrl=${path}`;
