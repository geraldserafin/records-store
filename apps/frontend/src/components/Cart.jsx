import { createSignal, Show, For, onCleanup, onMount } from "solid-js";
import cart from "../lib/cart";
import { useNavigate } from "@solidjs/router";

export default function Cart() {
  const [isOpen, setIsOpen] = createSignal(false);
  const navigate = useNavigate();
  let containerRef;

  const handleClickOutside = (e) => {
    if (containerRef && !containerRef.contains(e.target)) {
      setIsOpen(false);
    }
  };

  onMount(() => {
    document.addEventListener("mousedown", handleClickOutside);
  });

  onCleanup(() => {
    document.removeEventListener("mousedown", handleClickOutside);
  });

  return (
    <div ref={containerRef} class="z-50 relative">
      <button onClick={() => setIsOpen(!isOpen())}>
        Cart ({cart.count()})
      </button>

      <Show when={isOpen()}>
        <div class="bg-white px-2 shadow-lg w-64 max-h-96 overflow-auto absolute border pb-3">
          <h2 class="border-b">Cart</h2>

          <For each={cart.state.items}>
            {(item) => {
              return (
                <div class="flex flex-col border-b py-2 gap-2">
                  <div class="flex gap-2">
                    <img
                      src={item.images?.[0]}
                      class="w-12 h-12 object-cover"
                    />
                    <div class="flex flex-col">
                      <span>
                        {item.name} by {item.mainArtist?.name}
                      </span>
                      <span>${item.price}</span>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button onClick={() => cart.updateQuantity(item.id, -1)}>
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => cart.updateQuantity(item.id, 1)}>
                      +
                    </button>
                    <button onClick={() => cart.removeFromCart(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              );
            }}
          </For>

          <div class="mt-4">
            <p>Total: ${cart.total().toFixed(2)}</p>
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/checkout");
              }}
              disabled={cart.state.items.length === 0}
            >
              Checkout
            </button>
          </div>
        </div>
      </Show>
    </div>
  );
}
