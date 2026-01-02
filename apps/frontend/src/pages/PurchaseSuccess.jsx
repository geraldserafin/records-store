import { onMount } from "solid-js";
import { A } from "@solidjs/router";
import { CheckCircle } from "lucide-solid";
import { cartStore } from "../features/cart/cart.store";

export default function PurchaseSuccess() {
  onMount(() => {
    cartStore.clear();
  });

  return (
    <div class="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
      <div class="bg-green-50 text-green-600 p-6 rounded-full mb-6 animate-bounce">
        <CheckCircle size={64} />
      </div>
      <h1 class="text-4xl font-extrabold text-gray-900 mb-4">Payment Successful!</h1>
      <p class="text-lg text-gray-600 max-w-md mb-8">
        Thank you for your purchase. We've received your order and sent a confirmation email to you.
      </p>
      <div class="flex gap-4">
        <A 
          href="/shop" 
          class="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          Continue Shopping
        </A>
        <A 
          href="/profile" 
          class="px-8 py-3 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          View Orders
        </A>
      </div>
    </div>
  );
}
