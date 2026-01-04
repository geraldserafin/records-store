import { useNavigate, useSearchParams } from "@solidjs/router";
import cart from "../lib/cart";
import { onMount, createSignal, Show } from "solid-js";
import api from "../lib/api";
import userStore from "../lib/user";

export default function Success() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(false);

  onMount(async () => {
    const sessionId = searchParams.session_id;
    if (sessionId) {
      try {
        await api.get(`purchases/verify/${sessionId}`).json();
        cart.clearCart();
        // Revalidate orders in the sidebar
        await userStore.refetchOrders();
      } catch (e) {
        console.error("Verification failed", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  });

  return (
    <div class="p-8 text-center">
      <Show when={loading()}>
        <p>Verifying your payment...</p>
      </Show>
      
      <Show when={!loading() && !error()}>
        <h1 class="text-2xl font-bold text-green-600">Payment Successful!</h1>
        <p class="mt-4">Thank you for your purchase. Your order is being processed.</p>
        <button 
          onClick={() => navigate("/")}
          class="mt-6 bg-black text-white px-4 py-2"
        >
          Continue Shopping
        </button>
      </Show>

      <Show when={error()}>
        <h1 class="text-2xl font-bold text-red-600">Verification Error</h1>
        <p class="mt-4">We couldn't verify your payment. Please contact support if you were charged.</p>
        <button 
          onClick={() => navigate("/")}
          class="mt-6 bg-black text-white px-4 py-2"
        >
          Go Home
        </button>
      </Show>
    </div>
  );
}
