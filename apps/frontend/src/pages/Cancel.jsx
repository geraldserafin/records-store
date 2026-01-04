import { useNavigate } from "@solidjs/router";

export default function Cancel() {
  const navigate = useNavigate();

  return (
    <div class="p-8 text-center">
      <h1 class="text-2xl font-bold text-red-600">Payment Cancelled</h1>
      <p class="mt-4">Your payment was cancelled. You haven't been charged.</p>
      <button 
        onClick={() => navigate("/checkout")}
        class="mt-6 bg-black text-white px-4 py-2"
      >
        Return to Checkout
      </button>
    </div>
  );
}
