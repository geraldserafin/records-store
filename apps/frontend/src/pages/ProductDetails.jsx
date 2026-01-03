import { useParams, useNavigate, useSearchParams } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { fetchProductById } from "../features/products/products.api";
import { createMemo, Show, For, createSignal, createResource } from "solid-js";
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-solid";
import { cartStore } from "../features/cart/cart.store";
import { api } from "../lib/api";
import { cn } from "../lib/utils";

export default function ProductDetailsPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = createSignal(0);

  const query = createQuery(() => ({
    queryKey: ["product", params.id],
    queryFn: () => fetchProductById(params.id),
  }));

  const product = () => query.data;

  const handleAddToCart = () => {
    if (product()) {
      cartStore.addItem(product());
    }
  };

  const handleBack = (e) => {
    e.preventDefault();
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        navigate("/");
      });
    } else {
      navigate("/");
    }
  };

  const nextImage = () => {
    const images = product()?.images;
    if (images && images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    const images = product()?.images;
    if (images && images.length > 1) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + images.length) % images.length,
      );
    }
  };

  return (
    <div class="max-w-3xl">
      <Show when={query.isLoading}>
        <p class="italic">Loading...</p>
      </Show>
      <Show when={query.isError}>
        <p class="bg-black text-white p-2">Error: {query.error.message}</p>
      </Show>

      <Show when={query.isSuccess}>
        <div class="space-y-12">
          <div class="space-y-6">
            <a
              href="/"
              onClick={handleBack}
              class="text-sm opacity-50 hover:opacity-100 hover:underline"
            >
              ← Back to collection
            </a>

            <div class="space-y-2 mt-8 text-5xl">
              <h1 class="text-4xl font-black uppercase tracking-tight leading-none">
                {product().name}
              </h1>
              <p class="text-2xl font-bold text-(--accent-color) mt-2">
                ${Number(product().price).toFixed(0)}.00
              </p>
            </div>

            <p class="text-xl leading-relaxed text-gray-800">
              {product().shortDescription || "No summary available."}
            </p>
          </div>

          <div class="space-y-4">
            <div
              class="w-full aspect-square bg-white border border-black/5"
              style={{ "view-transition-name": `product-image-${params.id}` }}
            >
              <Show
                when={product().images?.length > 0}
                fallback={
                  <div class="w-full h-full flex items-center justify-center opacity-10 italic">
                    No image available
                  </div>
                }
              >
                <img
                  src={product().images[currentImageIndex()]}
                  alt={product().name}
                  class="w-full h-full object-contain"
                />
              </Show>
            </div>
            <Show when={product().images?.length > 1}>
              <div class="flex gap-4 items-center text-sm">
                <button
                  onClick={prevImage}
                  class="bg-gray-100 px-3 py-1 hover:bg-gray-200"
                >
                  Previous
                </button>
                <button
                  onClick={nextImage}
                  class="bg-gray-100 px-3 py-1 hover:bg-gray-200"
                >
                  Next
                </button>
                <span class="ml-auto opacity-30 uppercase tracking-widest">
                  Image {currentImageIndex() + 1} of {product().images.length}
                </span>
              </div>
            </Show>
            <div class="flex items-center gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product().stock === 0}
                class="bg-black text-white px-12 py-4 font-black uppercase tracking-widest hover:bg-[var(--accent-color)] transition-colors"
              >
                {product().stock === 0 ? "Out of stock" : "Add to cart"}
              </button>
              <Show when={product().stock > 0}>
                <span class="opacity-30 italic">
                  ({product().stock} available)
                </span>
              </Show>
            </div>
          </div>

          <div class="space-y-12 pt-8 border-t border-black/10">
            <section>
              <h2 class="text-sm font-black uppercase tracking-widest border-b border-black mb-6">
                Description
              </h2>
              <div class="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                {product().description || "No further details available."}
              </div>
            </section>

            <section>
              <h2 class="text-sm font-black uppercase tracking-widest border-b border-black mb-6">
                Details
              </h2>
              <ul class="list-none p-0 m-0 space-y-3">
                 <Show when={product().artists?.length > 0}>
                   <li class="flex justify-between border-b border-black/5 pb-1 text-sm">
                      <span class="opacity-40 uppercase text-xs font-bold">Artist</span>
                      <span class="font-bold">{product().artists.map(a => a.name).join(', ')}</span>
                   </li>
                 </Show>
                 <Show when={product().genres?.length > 0}>
                   <li class="flex justify-between border-b border-black/5 pb-1 text-sm">
                      <span class="opacity-40 uppercase text-xs font-bold">Genre</span>
                      <span class="font-bold">{product().genres.map(g => g.name).join(', ')}</span>
                   </li>
                 </Show>
                 <Show when={product().category}>
                   <li class="flex justify-between border-b border-black/5 pb-1 text-sm">
                      <span class="opacity-40 uppercase text-xs font-bold">Type</span>
                      <span class="font-bold">{product().category.name}</span>
                   </li>
                 </Show>
              </ul>
            </section>
          </div>
        </div>
      </Show>
    </div>
  );
}