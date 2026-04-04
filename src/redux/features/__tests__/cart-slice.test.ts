import cartReducer, {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
} from '../cart-slice';

const makeItem = (overrides = {}) => ({
  id: 1,
  title: 'Oyster Mushroom Powder',
  price: 499,
  quantity: 1,
  imgs: { thumbnails: ['/img.jpg'], previews: ['/img.jpg'] },
  ...overrides,
});

describe('cart-slice', () => {
  const emptyState = { items: [] };

  // ─── addItemToCart ────────────────────────────────────────

  describe('addItemToCart', () => {
    it('adds a new item to an empty cart', () => {
      const next = cartReducer(emptyState, addItemToCart(makeItem()));
      expect(next.items).toHaveLength(1);
      expect(next.items[0].quantity).toBe(1);
    });

    it('increments quantity when same item is added again', () => {
      const state = cartReducer(emptyState, addItemToCart(makeItem()));
      const next = cartReducer(state, addItemToCart(makeItem({ quantity: 2 })));
      expect(next.items).toHaveLength(1);
      expect(next.items[0].quantity).toBe(3);
    });

    it('stores stockQuantity on the cart item', () => {
      const next = cartReducer(
        emptyState,
        addItemToCart(makeItem({ stockQuantity: 10 }))
      );
      expect(next.items[0].stockQuantity).toBe(10);
    });

    it('caps initial quantity to stockQuantity', () => {
      const next = cartReducer(
        emptyState,
        addItemToCart(makeItem({ quantity: 5, stockQuantity: 3 }))
      );
      expect(next.items[0].quantity).toBe(3);
    });

    it('caps cumulative quantity to stockQuantity when adding more', () => {
      const state = cartReducer(
        emptyState,
        addItemToCart(makeItem({ quantity: 2, stockQuantity: 5 }))
      );
      // Try adding 4 more — should cap at 5
      const next = cartReducer(
        state,
        addItemToCart(makeItem({ quantity: 4, stockQuantity: 5 }))
      );
      expect(next.items[0].quantity).toBe(5);
    });

    it('allows unlimited quantity when stockQuantity is not provided', () => {
      const state = cartReducer(emptyState, addItemToCart(makeItem({ quantity: 50 })));
      const next = cartReducer(state, addItemToCart(makeItem({ quantity: 50 })));
      expect(next.items[0].quantity).toBe(100);
    });

    it('uses existing stockQuantity to cap when new dispatch omits it', () => {
      // First add with stockQuantity=3
      const state = cartReducer(
        emptyState,
        addItemToCart(makeItem({ quantity: 2, stockQuantity: 3 }))
      );
      // Second add without stockQuantity — should still cap at 3
      const next = cartReducer(
        state,
        addItemToCart(makeItem({ quantity: 5 }))
      );
      expect(next.items[0].quantity).toBe(3);
    });

    it('updates stockQuantity when new value is provided', () => {
      const state = cartReducer(
        emptyState,
        addItemToCart(makeItem({ stockQuantity: 3 }))
      );
      const next = cartReducer(
        state,
        addItemToCart(makeItem({ quantity: 1, stockQuantity: 10 }))
      );
      expect(next.items[0].stockQuantity).toBe(10);
    });

    it('preserves discountedPrice', () => {
      const next = cartReducer(
        emptyState,
        addItemToCart(makeItem({ discountedPrice: 399 }))
      );
      expect(next.items[0].discountedPrice).toBe(399);
    });
  });

  // ─── removeItemFromCart ───────────────────────────────────

  describe('removeItemFromCart', () => {
    it('removes item by id', () => {
      const state = cartReducer(emptyState, addItemToCart(makeItem()));
      const next = cartReducer(state, removeItemFromCart(1));
      expect(next.items).toHaveLength(0);
    });

    it('does not affect other items', () => {
      let state = cartReducer(emptyState, addItemToCart(makeItem({ id: 1 })));
      state = cartReducer(state, addItemToCart(makeItem({ id: 2, title: 'Button Mushroom' })));
      const next = cartReducer(state, removeItemFromCart(1));
      expect(next.items).toHaveLength(1);
      expect(next.items[0].id).toBe(2);
    });
  });

  // ─── updateCartItemQuantity ───────────────────────────────

  describe('updateCartItemQuantity', () => {
    it('updates quantity of an existing item', () => {
      const state = cartReducer(emptyState, addItemToCart(makeItem()));
      const next = cartReducer(
        state,
        updateCartItemQuantity({ id: 1, quantity: 5 })
      );
      expect(next.items[0].quantity).toBe(5);
    });

    it('does nothing if item does not exist', () => {
      const state = cartReducer(emptyState, addItemToCart(makeItem()));
      const next = cartReducer(
        state,
        updateCartItemQuantity({ id: 999, quantity: 5 })
      );
      expect(next.items[0].quantity).toBe(1);
    });
  });

  // ─── removeAllItemsFromCart ───────────────────────────────

  describe('removeAllItemsFromCart', () => {
    it('clears the entire cart', () => {
      let state = cartReducer(emptyState, addItemToCart(makeItem({ id: 1 })));
      state = cartReducer(state, addItemToCart(makeItem({ id: 2 })));
      const next = cartReducer(state, removeAllItemsFromCart());
      expect(next.items).toHaveLength(0);
    });
  });
});
