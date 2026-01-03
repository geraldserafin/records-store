import { A, useNavigate } from "@solidjs/router";
import { cartStore } from "../cart/cart.store";
import { Show } from "solid-js";
import { cn } from "../../lib/utils";

export default function ProductCard(props) {
  const { product } = props;
  const navigate = useNavigate();

  const artistValue = () => {
    if (product.artists && product.artists.length > 0) {
      return product.artists.map(a => a.name).join(", ");
    }
    return product.category?.name;
  };

  const handleClick = (e) => {
    e.preventDefault();
    if (product.stock === 0) return;

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        navigate(`/products/${product.id}`);
      });
    } else {
      navigate(`/products/${product.id}`);
    }
  };

  return (
    <div class={cn("bg-white", product.stock === 0 && "opacity-40")}>
      <a
        href={`/products/${product.id}`}
        class={cn(
          "block w-full pr-2 pt-5",
          product.stock === 0 ? "cursor-not-allowed" : "cursor-pointer",
        )}
        onClick={handleClick}
      >
        <div class="aspect-square w-full bg-gray-50 mb-4 flex items-center justify-center">
          <div
            class="w-full h-full"
            style={{ "view-transition-name": `product-image-${product.id}` }}
          >
            <Show
              when={product.images && product.images.length > 0}
              fallback={
                <div class="text-gray-300 font-bold italic">No image</div>
              }
            >
              <img
                src={product.images[0]}
                alt={product.name}
                class="w-full h-full object-contain"
              />
            </Show>
          </div>
        </div>

        <div class="space-y-1 p-2">
          <h3 class="font-bold  group-hover:underline truncate">
            {product.name}
          </h3>
          <div class="flex justify-between items-baseline">
            <span class="truncate pr-2">{artistValue()}</span>
            <span>${Number(product.price).toFixed(0)}</span>
          </div>
          <Show when={product.stock === 0}>
            <p class="text-red-600 font-bold mt-1">Out of stock</p>
          </Show>
        </div>
      </a>
    </div>
  );
}