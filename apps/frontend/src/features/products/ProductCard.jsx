import { A, useNavigate } from "@solidjs/router";
import { cartStore } from "../cart/cart.store";
import { Show } from "solid-js";
import { cn } from "../../lib/utils";

export default function ProductCard(props) {
  const { product } = props;
  const navigate = useNavigate();

  // Helper to extract value regardless of type
  const getValue = (av) => av.stringValue ?? av.numberValue ?? av.booleanValue;

  const artistValue = () => {
    const artistAttr = product.attributeValues?.find(
      (av) => av.attribute?.name?.toLowerCase() === "artist",
    );
    return artistAttr ? getValue(artistAttr) : product.category?.name;
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
    <div class={cn("group flex flex-col gap-2", product.stock === 0 && "opacity-60")}>
      <a 
        href={`/products/${product.id}`} 
        class={cn("block w-full", product.stock === 0 ? "cursor-not-allowed" : "cursor-pointer")}
        onClick={handleClick}
      >
        <div class="aspect-square w-full bg-gray-100 relative mb-3">
          {/* Visual Overlays (Outside Transition Box) */}
          <div class="absolute inset-0 z-30 border border-transparent group-hover:border-black transition-colors pointer-events-none" />
          
          <Show when={product.stock === 0}>
            <div class="absolute inset-0 z-20 flex items-center justify-center pointer-events-none font-mono">
              <span class="bg-black text-white text-[10px] font-bold uppercase px-3 py-1 tracking-widest">
                Sold Out
              </span>
            </div>
          </Show>

          {/* Pure Transition Box */}
          <div 
            class="w-full h-full overflow-hidden"
            style={{ "view-transition-name": `product-image-${product.id}` }}
          >
            <Show 
              when={product.images && product.images.length > 0}
              fallback={
                <div class="w-full h-full flex items-center justify-center bg-gray-50 text-gray-200">
                  <span class="text-6xl font-black opacity-10 uppercase">
                    {product.category?.name?.substring(0, 2) || "VN"}
                  </span>
                </div>
              }
            >
              <img 
                src={product.images[0]} 
                alt={product.name} 
                class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
              />
            </Show>
          </div>
        </div>

        <div class="flex flex-col gap-0.5">
          <div class="flex justify-between items-baseline text-sm text-black truncate pr-4 font-mono">
            <h3 class="truncate">{product.name}</h3>
            <span>${Number(product.price).toFixed(0)}</span>
          </div>

          <p class="text-sm text-gray-400 font-mono">{artistValue()}</p>
        </div>
      </a>
    </div>
  );
}