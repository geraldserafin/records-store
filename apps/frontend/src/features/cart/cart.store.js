import { createStore } from "solid-js/store";
import { createEffect } from "solid-js";

const STORE_KEY = "vinyl_store_cart";

const getInitialState = () => {
  try {
    const stored = localStorage.getItem(STORE_KEY);
    if (!stored) return { items: [] };
    
    const parsed = JSON.parse(stored);
    // Ensure valid structure
    if (parsed && Array.isArray(parsed.items)) {
      return parsed;
    }
    return { items: [] };
  } catch (e) {
    console.error("Cart load error:", e);
    return { items: [] };
  }
};

const [state, setState] = createStore(getInitialState());

// Persistence
createEffect(() => {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
});

export const cartStore = {
  get state() { return state; },

  addItem(product) {
    setState("items", (items) => {
      const currentItems = items || [];
      const existing = currentItems.find((i) => i.product.id === product.id);
      
      if (existing) {
        return currentItems.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...currentItems, { product, quantity: 1 }];
    });
  },

  removeItem(productId) {
    setState("items", (items) => items.filter((i) => i.product.id !== productId));
  },

  updateQuantity(productId, quantity) {
    if (quantity < 1) {
      this.removeItem(productId);
      return;
    }
    setState("items", (items) =>
      items.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      )
    );
  },

  clear() {
    setState("items", []);
  },

  get count() {
    return state.items.reduce((acc, item) => acc + item.quantity, 0);
  },

  get total() {
    return state.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  },
};
