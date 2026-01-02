import { cartStore } from "./cart.store";
import { Show } from "solid-js";
import { ShoppingBag } from "lucide-solid";

export default function CartButton(props) {
  return (
    <button 
      class="relative p-2 text-black hover:text-gray-600 transition-colors"
      onClick={props.onClick}
    >
      <div class="flex items-center gap-1">
        <ShoppingBag size={20} />
        <Show when={cartStore.count > 0}>
          <span class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
            {cartStore.count}
          </span>
        </Show>
      </div>
    </button>
  );
}
