import Header from "./Header";
import CartDrawer from "../features/cart/CartDrawer";
import { Show, createSignal } from "solid-js";

export default function Layout(props) {
  const [isCartOpen, setIsCartOpen] = createSignal(false);

  return (
    <div class="min-h-screen bg-white text-black font-mono antialiased selection:bg-black selection:text-white">
      <Header onCartClick={() => setIsCartOpen(true)} />

      <main class="container mx-auto py-12 px-4">
        {props.children}
      </main>

      <Show when={isCartOpen()}>
        <CartDrawer onClose={() => setIsCartOpen(false)} />
      </Show>
    </div>
  );
}
