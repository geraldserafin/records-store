import { cartStore } from "./cart.store";
import { Show } from "solid-js";
import { ShoppingBag } from "lucide-solid";

export default function CartButton(props) {
  return (
    <button 
      class="p-0 bg-transparent text-blue-700 underline hover:text-black transition-colors"
      onClick={props.onClick}
    >
      Shopping cart {cartStore.count > 0 && `(${cartStore.count})`}
    </button>
  );
}
