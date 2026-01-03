import { cartStore } from "./cart.store";
import { For, Show, createSignal, onMount } from "solid-js";
import { api } from "../../lib/api";
import { authStore } from "../auth/auth.store";
import { createStore } from "solid-js/store";

export default function CartDrawer(props) {
  const [loading, setLoading] = createSignal(false);
  const [step, setStep] = createSignal("cart"); // 'cart' | 'shipping'
  const [isVisible, setIsVisible] = createSignal(false);

  const [shipping, setShipping] = createStore({
    guestEmail: "",
    shippingName: "",
    shippingAddress: "",
    shippingCity: "",
    shippingPostalCode: "",
    shippingCountry: "",
  });

  onMount(() => {
    // Trigger animation after mount
    setTimeout(() => setIsVisible(true), 50);
  });

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(props.onClose, 50); // Wait for transition
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const items = cartStore.state.items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const payload = {
        items,
        ...shipping,
      };

      if (authStore.state.user) {
        delete payload.guestEmail;
      }

      const response = await api.post("purchases", { json: payload });
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned", data);
      }
    } catch (error) {
      console.error("Checkout failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      class="fixed top-1 right-1 z-50 w-full max-w-xs bg-(--bg-color) flex flex-col pointer-events-auto border"
      role="dialog"
      aria-modal="true"
    >
      <div class="p-4">
        <div class="font-bold text-lg mb-2 underline">
          Shopping cart
          <button onClick={handleClose} class="text-red-600 underline p-0">
            [X]
          </button>
        </div>
        <div class="flex gap-4">
          <Show when={step() === "shipping"}>
            <button
              onClick={() => setStep("cart")}
              class="text-blue-700 underline p-0"
            >
              [Back]
            </button>
          </Show>
        </div>
      </div>

      <div class="overflow-y-auto p-4 space-y-10 max-h-[70vh]">
        {/* Content same as before */}
        <Show when={step() === "cart"}>
          <Show
            when={cartStore.state.items.length > 0}
            fallback={
              <div class="opacity-50 italic">
                The manifest is currently void.
              </div>
            }
          >
            <ul class="list-none p-0 m-0 space-y-12">
              <For each={cartStore.state.items}>
                {(item) => (
                  <li class="space-y-3">
                    <div class="font-bold text-blue-700 underline">
                      {item.product.name}
                    </div>

                    <Show when={item.product.images?.length > 0}>
                      <div class="w-24 aspect-square bg-white border border-black/5">
                        <img
                          src={item.product.images[0]}
                          class="w-full h-full object-contain"
                        />
                      </div>
                    </Show>

                    <ul class="list-none p-0 m-0 text-sm space-y-1">
                      <li>
                        <span class="opacity-40 uppercase text-[10px]">
                          Unit price:
                        </span>{" "}
                        ${item.product.price}
                      </li>
                      <li>
                        <span class="opacity-40 uppercase text-[10px]">
                          Quantity:
                        </span>{" "}
                        {item.quantity}
                      </li>
                      <li>
                        <span class="opacity-40 uppercase text-[10px]">
                          Valuation:
                        </span>{" "}
                        ${(item.product.price * item.quantity).toFixed(0)}
                      </li>
                    </ul>

                    <div class="flex gap-4 pt-1 font-bold">
                      <button
                        onClick={() =>
                          cartStore.updateQuantity(
                            item.product.id,
                            item.quantity + 1,
                          )
                        }
                        class="text-blue-700 underline p-0"
                      >
                        [+]
                      </button>
                      <button
                        onClick={() =>
                          cartStore.updateQuantity(
                            item.product.id,
                            item.quantity - 1,
                          )
                        }
                        class="text-blue-700 underline p-0"
                      >
                        [-]
                      </button>
                      <button
                        onClick={() => cartStore.removeItem(item.product.id)}
                        class="text-red-600 underline p-0"
                      >
                        [X]
                      </button>
                    </div>
                  </li>
                )}
              </For>
            </ul>
          </Show>
        </Show>

        <Show when={step() === "shipping"}>
          <div class="space-y-8">
            <div class="font-bold border-b border-black pb-1 italic">
              Registry Details
            </div>
            <form
              id="shipping-form"
              onSubmit={handleCheckout}
              class="space-y-6"
            >
              <Show when={!authStore.state.user}>
                <label class="block">
                  <span class="block opacity-40 uppercase text-[10px] font-bold">
                    Email:
                  </span>
                  <input
                    type="email"
                    required
                    class="w-full border-b border-black bg-transparent outline-none py-1"
                    value={shipping.guestEmail}
                    onInput={(e) => setShipping("guestEmail", e.target.value)}
                  />
                </label>
              </Show>
              <label class="block">
                <span class="block opacity-40 uppercase text-[10px] font-bold">
                  Name:
                </span>
                <input
                  type="text"
                  required
                  class="w-full border-b border-black bg-transparent outline-none py-1"
                  value={shipping.shippingName}
                  onInput={(e) => setShipping("shippingName", e.target.value)}
                />
              </label>
              <label class="block">
                <span class="block opacity-40 uppercase text-[10px] font-bold">
                  Address:
                </span>
                <input
                  type="text"
                  required
                  class="w-full border-b border-black bg-transparent outline-none py-1"
                  value={shipping.shippingAddress}
                  onInput={(e) =>
                    setShipping("shippingAddress", e.target.value)
                  }
                />
              </label>
              <div class="grid grid-cols-2 gap-6">
                <label class="block">
                  <span class="block opacity-40 uppercase text-[10px] font-bold">
                    City:
                  </span>
                  <input
                    type="text"
                    required
                    class="w-full border-b border-black bg-transparent outline-none py-1"
                    value={shipping.shippingCity}
                    onInput={(e) => setShipping("shippingCity", e.target.value)}
                  />
                </label>
                <label class="block">
                  <span class="block opacity-40 uppercase text-[10px] font-bold">
                    Postal Code:
                  </span>
                  <input
                    type="text"
                    required
                    class="w-full border-b border-black bg-transparent outline-none py-1"
                    value={shipping.shippingPostalCode}
                    onInput={(e) =>
                      setShipping("shippingPostalCode", e.target.value)
                    }
                  />
                </label>
              </div>
              <label class="block">
                <span class="block opacity-40 uppercase text-[10px] font-bold">
                  Country:
                </span>
                <input
                  type="text"
                  required
                  class="w-full border-b border-black bg-transparent outline-none py-1"
                  value={shipping.shippingCountry}
                  onInput={(e) =>
                    setShipping("shippingCountry", e.target.value)
                  }
                />
              </label>
            </form>
          </div>
        </Show>
      </div>
      {/* Footer */}
      <Show when={cartStore.state.items.length > 0}>
        <div class="p-4 border-t border-black space-y-4">
          <div class="flex justify-between items-baseline">
            <span class="opacity-40 uppercase text-[10px] font-bold">
              Subtotal:
            </span>
            <span class="font-black text-xl tracking-tighter">
              ${cartStore.total.toFixed(0)}.00
            </span>
          </div>

          <Show when={step() === "cart"}>
            <button
              onClick={() => setStep("shipping")}
              class="w-full bg-black text-white py-3 font-bold hover:bg-(--accent-color) transition-colors"
            >
              Proceed to checkout
            </button>
          </Show>

          <Show when={step() === "shipping"}>
            <button
              form="shipping-form"
              type="submit"
              disabled={loading()}
              class="w-full bg-(--accent-color) text-white py-3 font-bold"
            >
              <Show when={loading()} fallback="Authorize payment">
                Processing transaction...
              </Show>
            </button>
          </Show>
        </div>
      </Show>
    </div>
  );
}
