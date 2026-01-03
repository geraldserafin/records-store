import Header from "./Header";
import CartDrawer from "../features/cart/CartDrawer";
import { Show, createSignal } from "solid-js";

export default function Layout(props) {
  const [isCartOpen, setIsCartOpen] = createSignal(false);

  return (
    <div class="min-h-screen retro-theme">
      <Header onCartClick={() => setIsCartOpen(true)} />

      <main class="mt-4">
        {props.children}
      </main>

      <Show when={isCartOpen()}>
        <CartDrawer onClose={() => setIsCartOpen(false)} />
      </Show>
    </div>
  );
}
