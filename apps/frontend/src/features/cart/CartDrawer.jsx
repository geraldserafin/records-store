import { cartStore } from "./cart.store";
import { For, Show, createSignal, onMount } from "solid-js";
import {
  X,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Loader2,
  ArrowLeft,
} from "lucide-solid";
import { api } from "../../lib/api";
import { authStore } from "../auth/auth.store";
import { createStore } from "solid-js/store";
import { cn } from "../../lib/utils";

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
    setTimeout(props.onClose, 300); // Wait for transition
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
      class="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        class={cn(
          "absolute inset-0 bg-transparent backdrop-blur-sm transition-opacity duration-300",
          isVisible() ? "opacity-100" : "opacity-0",
        )}
        onClick={handleClose}
      />

      <div class="fixed inset-y-0 right-0 max-w-full flex">
        <div
          class={cn(
            "w-screen max-w-md bg-white border-l border-black flex flex-col transform transition-transform duration-300 ease-out",
            isVisible() ? "translate-x-0" : "translate-x-full",
          )}
        >
          {/* Header */}
          <div class="flex items-center justify-between px-6 py-6 border-b border-gray-200">
            <h2 class="text-base font-semibold text-black flex items-center gap-2">
              <Show when={step() === "shipping"}>
                <button
                  onClick={() => setStep("cart")}
                  class="mr-2 text-black hover:text-gray-500 transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>
              </Show>
              {step() === "cart" ? "Shopping Cart" : "Shipping Details"}
            </h2>
            <button
              type="button"
              class="text-gray-400 hover:text-black transition-colors"
              onClick={handleClose}
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div class="flex-1 overflow-y-auto px-6 py-6">
            <Show when={step() === "cart"}>
              <Show
                when={cartStore.state.items.length > 0}
                fallback={
                  <div class="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <p class="text-gray-500">Your cart is empty.</p>
                    <button
                      onClick={handleClose}
                      class="text-black underline hover:text-gray-600"
                    >
                      Continue Shopping
                    </button>
                  </div>
                }
              >
                <ul class="space-y-8">
                  <For each={cartStore.state.items}>
                    {(item) => (
                      <li class="flex py-2 gap-4">
                        <div class="h-24 w-24 flex-shrink-0 bg-gray-100 flex items-center justify-center rounded-sm">
                          {/* Placeholder */}
                          <div class="w-full h-full bg-gray-100" />
                        </div>

                        <div class="flex flex-1 flex-col justify-between py-1">
                          <div>
                            <div class="flex justify-between text-sm font-medium text-black">
                              <h3>{item.product.name}</h3>
                              <p>
                                $
                                {(item.product.price * item.quantity).toFixed(
                                  2,
                                )}
                              </p>
                            </div>
                            <p class="mt-1 text-sm text-gray-500">
                              {item.product.category?.name}
                            </p>
                          </div>

                          <div class="flex items-center justify-between mt-4">
                            <div class="flex items-center border border-gray-300 rounded-full px-2 py-1">
                              <button
                                class="p-1 hover:text-gray-600 transition-colors"
                                onClick={() =>
                                  cartStore.updateQuantity(
                                    item.product.id,
                                    item.quantity - 1,
                                  )
                                }
                              >
                                <Minus size={14} />
                              </button>
                              <span class="px-3 text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                                class="p-1 hover:text-gray-600 transition-colors"
                                onClick={() =>
                                  cartStore.updateQuantity(
                                    item.product.id,
                                    item.quantity + 1,
                                  )
                                }
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            <button
                              type="button"
                              class="text-xs text-gray-400 hover:text-red-600 transition-colors"
                              onClick={() =>
                                cartStore.removeItem(item.product.id)
                              }
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    )}
                  </For>
                </ul>
              </Show>
            </Show>

                        <Show when={step() === 'shipping'}>
                          <form id="shipping-form" onSubmit={handleCheckout} class="space-y-6">
                            <Show when={!authStore.state.user}>
                              <div>
                                <label class="block text-xs font-bold uppercase tracking-widest mb-1 font-mono">Email</label>
                                <input 
                                  type="email" 
                                  required 
                                  placeholder="EMAIL ADDRESS"
                                  class="block w-full border-b border-gray-300 py-2 text-sm font-mono focus:outline-none focus:border-black transition-colors placeholder:text-gray-300"
                                  value={shipping.guestEmail}
                                  onInput={(e) => setShipping('guestEmail', e.target.value)}
                                />
                              </div>
                            </Show>
            
                            <div>
                              <label class="block text-xs font-bold uppercase tracking-widest mb-1 font-mono">Name</label>
                              <input 
                                type="text" 
                                required 
                                placeholder="FULL NAME"
                                class="block w-full border-b border-gray-300 py-2 text-sm font-mono focus:outline-none focus:border-black transition-colors placeholder:text-gray-300"
                                value={shipping.shippingName}
                                onInput={(e) => setShipping('shippingName', e.target.value)}
                              />
                            </div>
            
                            <div>
                              <label class="block text-xs font-bold uppercase tracking-widest mb-1 font-mono">Address</label>
                              <input 
                                type="text" 
                                required 
                                placeholder="STREET ADDRESS"
                                class="block w-full border-b border-gray-300 py-2 text-sm font-mono focus:outline-none focus:border-black transition-colors placeholder:text-gray-300"
                                value={shipping.shippingAddress}
                                onInput={(e) => setShipping('shippingAddress', e.target.value)}
                              />
                            </div>
            
                            <div class="grid grid-cols-2 gap-6">
                              <div>
                                <label class="block text-xs font-bold uppercase tracking-widest mb-1 font-mono">City</label>
                                <input 
                                  type="text" 
                                  required 
                                  placeholder="CITY"
                                  class="block w-full border-b border-gray-300 py-2 text-sm font-mono focus:outline-none focus:border-black transition-colors placeholder:text-gray-300"
                                  value={shipping.shippingCity}
                                  onInput={(e) => setShipping('shippingCity', e.target.value)}
                                />
                              </div>
                              <div>
                                <label class="block text-xs font-bold uppercase tracking-widest mb-1 font-mono">Postal Code</label>
                                <input 
                                  type="text" 
                                  required 
                                  placeholder="ZIP CODE"
                                  class="block w-full border-b border-gray-300 py-2 text-sm font-mono focus:outline-none focus:border-black transition-colors placeholder:text-gray-300"
                                  value={shipping.shippingPostalCode}
                                  onInput={(e) => setShipping('shippingPostalCode', e.target.value)}
                                />
                              </div>
                            </div>
            
                            <div>
                              <label class="block text-xs font-bold uppercase tracking-widest mb-1 font-mono">Country</label>
                              <input 
                                type="text" 
                                required 
                                placeholder="COUNTRY"
                                class="block w-full border-b border-gray-300 py-2 text-sm font-mono focus:outline-none focus:border-black transition-colors placeholder:text-gray-300"
                                value={shipping.shippingCountry}
                                onInput={(e) => setShipping('shippingCountry', e.target.value)}
                              />
                            </div>
                          </form>
                        </Show>
                      </div>
            
                      {/* Footer */}
                      <Show when={cartStore.state.items.length > 0}>
                        <div class="border-t border-black px-6 py-6 bg-white">
                          <div class="flex justify-between text-sm font-bold uppercase tracking-widest text-black mb-6 font-mono">
                            <p>Total</p>
                            <p>${cartStore.total.toFixed(2)}</p>
                          </div>
                          
                          <Show when={step() === 'cart'}>
                            <button
                              onClick={() => setStep('shipping')}
                              class="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors font-mono"
                            >
                              Proceed to Checkout
                            </button>
                          </Show>
            
                          <Show when={step() === 'shipping'}>
                            <button
                              form="shipping-form"
                              type="submit"
                              disabled={loading()}
                              class="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 font-mono"
                            >
                              <Show when={loading()} fallback="Pay Now">
                                Processing...
                              </Show>
                            </button>
                          </Show>
                        </div>
                      </Show>        </div>
      </div>
    </div>
  );
}
