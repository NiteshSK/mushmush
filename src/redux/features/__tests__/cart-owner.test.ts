/**
 * The bag follows the account it belongs to: guest sign-in, reloads,
 * account switches and sign-out on a shared browser.
 */
import cartReducer, {
  addItemToCart,
  applyServerPrices,
  missingDetailIds,
  MAX_SAVED_BAGS,
  refreshItemDetails,
  removeAllItemsFromCart,
  syncCartOwner,
  updateCartItemQuantity,
  type CartState,
} from "../cart-slice";

const A = "shopper-a@example.test";
const B = "shopper-b@example.test";

const cumin = { id: 50, title: "Cumin Seeds", slug: "cumin-seeds", price: 149, quantity: 2, stockQuantity: 50 };
const walnuts = { id: 41, title: "Premium Walnuts", slug: "premium-walnuts", price: 449, quantity: 1, stockQuantity: 40 };

const fresh = (): CartState => cartReducer(undefined, { type: "@@init" });
const run = (state: CartState, ...actions: Parameters<typeof cartReducer>[1][]) =>
  actions.reduce((s, action) => cartReducer(s, action), state);
const lines = (state: CartState) => state.items.map((i) => `${i.slug}x${i.quantity}`).join(", ");

describe("cart owner", () => {
  it("starts as an empty guest bag", () => {
    expect(fresh()).toEqual({ items: [], owner: null, saved: {} });
  });

  describe("guest signs in", () => {
    it("keeps the guest bag and gives it to the account", () => {
      const state = run(fresh(), addItemToCart(cumin), syncCartOwner(A));
      expect(lines(state)).toBe("cumin-seedsx2");
      expect(state.owner).toBe(A);
    });

    it("merges the guest bag with the account's saved bag, capped by stock", () => {
      let state = run(fresh(), syncCartOwner(A), addItemToCart({ ...cumin, quantity: 30 }), addItemToCart(walnuts), syncCartOwner(null));
      expect(state.items).toEqual([]);
      state = run(state, addItemToCart({ ...cumin, quantity: 25 }), syncCartOwner(A));
      expect(lines(state)).toBe("cumin-seedsx50, premium-walnutsx1");
      expect(state.saved).toEqual({});
    });

    it("lower-cases and trims the email", () => {
      const state = run(fresh(), addItemToCart(cumin), syncCartOwner("  Shopper-A@Example.TEST "));
      expect(state.owner).toBe(A);
      expect(run(state, syncCartOwner(A))).toBe(state);
    });
  });

  describe("signed-in reload", () => {
    it("does not change the bag when the session confirms the same account", () => {
      const state = run(fresh(), syncCartOwner(A), addItemToCart(cumin));
      expect(run(state, syncCartOwner(A))).toBe(state);
    });
  });

  describe("two accounts on one browser", () => {
    it("never shows A's bag to B, and gives A's bag back to A", () => {
      let state = run(fresh(), syncCartOwner(A), addItemToCart(cumin));
      state = run(state, syncCartOwner(null));
      expect(state.items).toEqual([]);
      expect(state.owner).toBeNull();

      state = run(state, syncCartOwner(B));
      expect(state.items).toEqual([]);
      state = run(state, addItemToCart(walnuts), syncCartOwner(null));

      state = run(state, syncCartOwner(A));
      expect(lines(state)).toBe("cumin-seedsx2");
      state = run(state, syncCartOwner(B)); // switch without signing out
      expect(lines(state)).toBe("premium-walnutsx1");
      expect(Object.keys(state.saved!)).toEqual([A]);
    });

    it("stashes A's bag when B signs in without A signing out first", () => {
      const state = run(fresh(), syncCartOwner(A), addItemToCart(cumin), syncCartOwner(B));
      expect(state.items).toEqual([]);
      expect(state.owner).toBe(B);
      expect(lines(run(state, syncCartOwner(A)))).toBe("cumin-seedsx2");
    });

    it("does not save an empty bag", () => {
      const state = run(fresh(), syncCartOwner(A), syncCartOwner(null));
      expect(state.saved).toEqual({});
    });

    it("drops a saved bag that the account emptied", () => {
      let state = run(fresh(), syncCartOwner(A), addItemToCart(cumin), syncCartOwner(null), syncCartOwner(A));
      state = run(state, removeAllItemsFromCart(), syncCartOwner(null));
      expect(state.saved).toEqual({});
    });

    it(`keeps at most ${MAX_SAVED_BAGS} saved bags and drops the oldest`, () => {
      let state = fresh();
      for (let n = 1; n <= MAX_SAVED_BAGS + 2; n++) {
        state = run(state, syncCartOwner(`user${n}@example.test`), addItemToCart({ ...cumin, quantity: n }), syncCartOwner(null));
      }
      expect(Object.keys(state.saved!)).toEqual([3, 4, 5, 6, 7].map((n) => `user${n}@example.test`));
    });

    it("makes a re-stashed account the most recent", () => {
      let state = run(fresh(), syncCartOwner("old@example.test"), addItemToCart(cumin), syncCartOwner(null));
      for (let n = 1; n < MAX_SAVED_BAGS; n++) {
        state = run(state, syncCartOwner(`user${n}@example.test`), addItemToCart(cumin), syncCartOwner(null));
      }
      state = run(state, syncCartOwner("old@example.test"), syncCartOwner(null));
      state = run(state, syncCartOwner("new@example.test"), addItemToCart(cumin), syncCartOwner(null));
      expect(Object.keys(state.saved!)).toContain("old@example.test");
      expect(Object.keys(state.saved!)).not.toContain("user1@example.test");
    });
  });

  describe("bags persisted before owners existed", () => {
    const legacy = { items: [{ id: 50, title: "Cumin Seeds", price: 149, quantity: 3 }] } as CartState;

    it("gives a legacy bag to the account that is signed in", () => {
      const state = run(legacy, syncCartOwner(A));
      expect(state.owner).toBe(A);
      expect(state.items).toHaveLength(1);
      expect(state.saved).toEqual({});
    });

    it("treats a legacy bag as a guest bag when nobody is signed in", () => {
      const state = run(legacy, syncCartOwner(null));
      expect(state.owner).toBeNull();
      expect(state.items).toHaveLength(1);
    });

    it("accepts the other reducers without owner or saved", () => {
      const state = run(legacy, addItemToCart(cumin), updateCartItemQuantity({ id: 50, quantity: 4 }),
        applyServerPrices([{ productId: 50, listPrice: 159, unitPrice: 139 }]), refreshItemDetails([{ id: 50, slug: "cumin-seeds", stockQuantity: 9 }]));
      expect(state.items[0]).toMatchObject({ quantity: 4, price: 159, discountedPrice: 139, slug: "cumin-seeds", stockQuantity: 9 });
    });
  });

  it("keeps the state serialisable for redux-persist", () => {
    const state = run(fresh(), syncCartOwner(A), addItemToCart({ ...cumin, imgs: { thumbnails: ["/t.png"], previews: ["/p.png"] } }),
      syncCartOwner(null), addItemToCart({ ...cumin, quantity: 1 }), syncCartOwner(A));
    expect(JSON.parse(JSON.stringify(state))).toEqual(state);
    expect(state.items[0].imgs).toEqual({ thumbnails: ["/t.png"], previews: ["/p.png"] });
  });
});

describe("refreshItemDetails", () => {
  const old = { id: 50, title: "Cumin Seeds", price: 149, quantity: 80 };

  it("fills in slug and stock, and caps quantity to stock", () => {
    const state = run({ items: [old] } as CartState, refreshItemDetails([{ id: 50, slug: "cumin-seeds", stockQuantity: 50 }]));
    expect(state.items[0]).toMatchObject({ slug: "cumin-seeds", stockQuantity: 50, quantity: 50 });
  });

  it("does not change prices", () => {
    const state = run({ items: [{ ...old, discountedPrice: 99 }] } as CartState,
      refreshItemDetails([{ id: 50, slug: "cumin-seeds", stockQuantity: 50, price: 1, discountedPrice: 1 } as never]));
    expect(state.items[0]).toMatchObject({ price: 149, discountedPrice: 99 });
  });

  it("keeps at least one when the product is sold out", () => {
    const state = run({ items: [old] } as CartState, refreshItemDetails([{ id: 50, slug: "cumin-seeds", stockQuantity: 0 }]));
    expect(state.items[0]).toMatchObject({ stockQuantity: 0, quantity: 1 });
  });

  it("leaves lines alone when the product is not in the list or a field is missing", () => {
    const state = run({ items: [old, { ...walnuts, slug: undefined }] } as CartState,
      refreshItemDetails([{ id: 41, slug: "premium-walnuts", stockQuantity: null }]));
    expect(state.items[0]).toEqual(old);
    expect(state.items[1]).toMatchObject({ slug: "premium-walnuts", stockQuantity: 40, quantity: 1 });
  });

  it("refreshes saved bags too", () => {
    const state = run({ items: [], owner: null, saved: { [A]: [old] } }, refreshItemDetails([{ id: 50, slug: "cumin-seeds", stockQuantity: 10 }]));
    expect(state.saved![A][0]).toMatchObject({ slug: "cumin-seeds", quantity: 10 });
  });
});

describe("missingDetailIds", () => {
  it("lists lines without slug or stock in the visible and saved bags, once each", () => {
    const state: CartState = {
      items: [cumin, { ...walnuts, slug: undefined }],
      owner: B,
      saved: { [A]: [{ ...cumin, stockQuantity: undefined }, { id: 7, title: "x", price: 1, quantity: 1 }, { ...walnuts, slug: undefined }] },
    };
    expect(missingDetailIds(state)).toEqual([41, 50, 7]);
  });

  it("returns nothing for complete bags and tolerates legacy state", () => {
    expect(missingDetailIds({ items: [cumin] })).toEqual([]);
  });
});
