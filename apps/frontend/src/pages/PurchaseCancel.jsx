import { A } from "@solidjs/router";
import { XCircle } from "lucide-solid";

export default function PurchaseCancel() {
  return (
    <div class="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
      <div class="bg-red-50 text-red-600 p-6 rounded-full mb-6">
        <XCircle size={64} />
      </div>
      <h1 class="text-4xl font-extrabold text-gray-900 mb-4">Payment Cancelled</h1>
      <p class="text-lg text-gray-600 max-w-md mb-8">
        Your payment was not processed. If you experienced any issues, please try again or contact support.
      </p>
      <div class="flex gap-4">
        <A 
          href="/shop" 
          class="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-lg"
        >
          Return to Shop
        </A>
      </div>
    </div>
  );
}
