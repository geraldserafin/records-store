import { createStore } from "solid-js/store";
import { createRoot } from "solid-js";

function createCart() {
  const [state, setState] = createStore({
    items: [],
  });

  const addToCart = (record) => {
    const existing = state.items.find((item) => item.id === record.id);
    if (existing) {
      setState(
        "items",
        (item) => item.id === record.id,
        "quantity",
        (q) => q + 1
      );
    } else {
      setState("items", [...state.items, { ...record, quantity: 1 }]);
    }
  };

  const removeFromCart = (recordId) => {
    setState("items", (items) => items.filter((item) => item.id !== recordId));
  };

  const updateQuantity = (recordId, delta) => {
    setState(
      "items",
      (item) => item.id === recordId,
      "quantity",
      (q) => Math.max(0, q + delta)
    );
    // Remove if quantity becomes 0
    if (state.items.find(i => i.id === recordId)?.quantity === 0) {
      removeFromCart(recordId);
    }
  };

  const clearCart = () => setState("items", []);

  const total = () => state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const count = () => state.items.reduce((acc, item) => acc + item.quantity, 0);

  return { state, addToCart, removeFromCart, updateQuantity, clearCart, total, count };
}

export default createRoot(createCart);
