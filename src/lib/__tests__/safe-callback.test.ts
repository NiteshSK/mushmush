import { DEFAULT_CALLBACK_URL, safeCallbackUrl, withCallbackUrl } from "../safe-callback";

const ORIGIN = "http://localhost:3000";

describe("safeCallbackUrl", () => {
  it.each([
    ["/checkout", "/checkout"],
    ["/shop?category=spices,seeds&sort=price-high", "/shop?category=spices,seeds&sort=price-high"],
    ["/shop-details/cumin-seeds#reviews", "/shop-details/cumin-seeds#reviews"],
    ["/orders/../checkout", "/checkout"],
    ["/", "/"],
  ])("keeps the same-origin path %s", (raw, expected) => {
    expect(safeCallbackUrl(raw)).toBe(expected);
  });

  it.each([
    ["https://evil.example"],
    ["http://evil.example/checkout"],
    ["//evil.example"],
    ["//evil.example/checkout"],
    ["/\\evil.example"],
    ["\\\\evil.example"],
    ["/\t/evil.example"],
    ["/\n/evil.example"],
    [" //evil.example"],
    [" //evil.example"],
    ["javascript:alert(1)"],
    ["data:text/html,hi"],
    ["checkout"],
    ["evil.example"],
    [""],
    [null],
    [undefined],
  ])("falls back to the homepage for %j", (raw) => {
    expect(safeCallbackUrl(raw as string | null | undefined)).toBe(DEFAULT_CALLBACK_URL);
    expect(safeCallbackUrl(raw as string | null | undefined, ORIGIN)).toBe(DEFAULT_CALLBACK_URL);
  });

  it("falls back to the homepage for a path longer than 2048 characters", () => {
    expect(safeCallbackUrl("/" + "a".repeat(2048))).toBe(DEFAULT_CALLBACK_URL);
  });

  it("keeps percent-encoded slashes inside the path, where they cannot change the host", () => {
    expect(safeCallbackUrl("/%2F%2Fevil.example")).toBe("/%2F%2Fevil.example");
    expect(safeCallbackUrl("/%5Cevil.example")).toBe("/%5Cevil.example");
  });

  it("turns an absolute URL on this site into a path only when the origin is known", () => {
    expect(safeCallbackUrl(`${ORIGIN}/checkout?step=2`, ORIGIN)).toBe("/checkout?step=2");
    expect(safeCallbackUrl(`${ORIGIN}/checkout`)).toBe(DEFAULT_CALLBACK_URL);
    expect(safeCallbackUrl("http://localhost:3001/checkout", ORIGIN)).toBe(DEFAULT_CALLBACK_URL);
    expect(safeCallbackUrl("https://localhost:3000/checkout", ORIGIN)).toBe(DEFAULT_CALLBACK_URL);
    expect(safeCallbackUrl("http://localhost:3000@evil.example/checkout", ORIGIN)).toBe(DEFAULT_CALLBACK_URL);
  });

  it.each([
    ["/auth/signin"],
    ["/auth/signin?callbackUrl=/checkout"],
    ["/auth/signup"],
    ["/auth/forgot-password"],
    ["/auth/reset-password?token=abc"],
    ["/auth/error"],
    ["/signin"],
    ["/SIGNUP"],
  ])("does not return to the form %s after signing in", (raw) => {
    expect(safeCallbackUrl(raw)).toBe(DEFAULT_CALLBACK_URL);
  });

  it("still allows pages whose names only start like an auth form", () => {
    expect(safeCallbackUrl("/signing-up-for-training")).toBe("/signing-up-for-training");
  });
});

describe("withCallbackUrl", () => {
  it("adds an encoded return URL to links between the auth pages", () => {
    expect(withCallbackUrl("/auth/signup", "/checkout")).toBe("/auth/signup?callbackUrl=%2Fcheckout");
    expect(withCallbackUrl("/auth/signin?error=x", "/shop?category=spices")).toBe("/auth/signin?error=x&callbackUrl=%2Fshop%3Fcategory%3Dspices");
  });

  it("leaves the link unchanged when the return URL is the homepage", () => {
    expect(withCallbackUrl("/auth/signup", "/")).toBe("/auth/signup");
    expect(withCallbackUrl("/auth/signup", "")).toBe("/auth/signup");
  });
});
