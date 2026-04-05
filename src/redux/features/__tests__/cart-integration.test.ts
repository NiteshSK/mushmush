/**
 * Integration tests for cart slice — add, remove, quantity, clear
 */
import cartReducer, {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
  selectTotalPrice,
} from "../cart-slice";

const sampleItem = {
  id: 1,
  title: "Fresh Oyster Mushrooms",
  price: 350,
  discountedPrice: 300,
  quantity: 1,
  imgs: { thumbnails: ["/img.jpg"], previews: ["/img.jpg"] },
};

const sampleItem2 = {
  id: 2,
  title: "Lion's Mane",
  price: 550,
  quantity: 1,
  imgs: { thumbnails: ["/img2.jpg"], previews: ["/img2.jpg"] },
};

describe("Cart Slice - Integration", () => {
  const initialState = { items: [] };

  it("adds an item to empty cart", () => {
    const state = cartReducer(initialState, addItemToCart(sampleItem));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].title).toBe("Fresh Oyster Mushrooms");
    expect(state.items[0].quantity).toBe(1);
  });

  it("increments quantity when same item added again", () => {
    let state = cartReducer(initialState, addItemToCart(sampleItem));
    state = cartReducer(state, addItemToCart(sampleItem));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
  });

  it("adds multiple different items", () => {
    let state = cartReducer(initialState, addItemToCart(sampleItem));
    state = cartReducer(state, addItemToCart(sampleItem2));
    expect(state.items).toHaveLength(2);
  });

  it("removes an item from cart", () => {
    let state = cartReducer(initialState, addItemToCart(sampleItem));
    state = cartReducer(state, addItemToCart(sampleItem2));
    state = cartReducer(state, removeItemFromCart(1));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe(2);
  });

  it("updates quantity of an item", () => {
    let state = cartReducer(initialState, addItemToCart(sampleItem));
    state = cartReducer(state, updateCartItemQuantity({ id: 1, quantity: 5 }));
    expect(state.items[0].quantity).toBe(5);
  });

  it("sets quantity to 0 when updated to 0", () => {
    let state = cartReducer(initialState, addItemToCart(sampleItem));
    state = cartReducer(state, updateCartItemQuantity({ id: 1, quantity: 0 }));
    expect(state.items[0].quantity).toBe(0);
  });

  it("clears all items from cart", () => {
    let state = cartReducer(initialState, addItemToCart(sampleItem));
    state = cartReducer(state, addItemToCart(sampleItem2));
    state = cartReducer(state, removeAllItemsFromCart());
    expect(state.items).toHaveLength(0);
  });

  it("calculates total price with discounted items", () => {
    let state = cartReducer(initialState, addItemToCart(sampleItem));
    state = cartReducer(state, addItemToCart(sampleItem2));
    // item1: discountedPrice 300 * 1 = 300, item2: price 550 * 1 = 550
    const total = selectTotalPrice({ cartReducer: state } as any);
    expect(total).toBe(850);
  });

  it("calculates total correctly with quantity > 1", () => {
    let state = cartReducer(initialState, addItemToCart(sampleItem));
    state = cartReducer(state, updateCartItemQuantity({ id: 1, quantity: 3 }));
    const total = selectTotalPrice({ cartReducer: state } as any);
    // discountedPrice 300 * 3 = 900
    expect(total).toBe(900);
  });
});
