import { useParams, useNavigate, useSearchParams } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { fetchProductById } from "../features/products/products.api";
import { createMemo, Show, For, createSignal, createResource } from "solid-js";
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-solid";
import { cartStore } from "../features/cart/cart.store";
import { api } from "../lib/api";
import { cn } from "../lib/utils";

const fetchCategories = async () => await api.get("categories").json();

export default function ProductDetailsPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = createSignal(0);

  const [categories] = createResource(fetchCategories);
  const query = createQuery(() => ({
    queryKey: ["product", params.id],
    queryFn: () => fetchProductById(params.id),
  }));

  const product = () => query.data;

  const groupedAttributes = createMemo(() => {
    const p = product();
    const cats = categories();
    if (!p || !p.category || !cats) return { top: [], bottom: [] };

    const top = [];
    const bottom = [];

    let currentCat = cats.find((c) => c.id === p.category.id);
    const visited = new Set();

    while (currentCat && !visited.has(currentCat.id)) {
      visited.add(currentCat.id);

      (currentCat.attributes || []).forEach((attrDef) => {
        const val = p.attributeValues?.find((av) => {
          const avAttrId =
            av.attribute?.id ||
            (typeof av.attribute === "number" ? av.attribute : null);
          return avAttrId === attrDef.id;
        });

        if (val) {
          if (attrDef.displaySection === "bottom") {
            bottom.push(val);
          } else {
            top.push(val);
          }
        }
      });

      if (currentCat.parentId) {
        currentCat = cats.find((c) => c.id === currentCat.parentId);
      } else {
        currentCat = null;
      }
    }

    return { top, bottom };
  });

  const getValue = (av) => av.stringValue ?? av.numberValue ?? av.booleanValue;

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
    <div class="w-full">
      <div class="mb-8">
        <a
          href="/"
          onClick={handleBack}
          class="inline-flex items-center gap-2 text-xs font-bold uppercase hover:text-gray-500 transition-colors font-mono"
        >
          <ArrowLeft size={14} /> Back to Shop
        </a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-0 border-black">
        {/* Left: Image Slider (PURE STRUCTURE) */}
        <div class="bg-white flex items-start justify-center">
          <div class="w-full aspect-square relative">
            {/* The Transition Box - matching ProductCard exactly */}
            <div
              class="w-full h-full overflow-hidden"
              style={{ "view-transition-name": `product-image-${params.id}` }}
            >
              <Show
                when={query.isSuccess && product()?.images?.length > 0}
                fallback={
                  <div class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                    <span class="text-[12rem] font-black opacity-10 uppercase select-none">
                      {query.isSuccess
                        ? product().category?.name?.substring(0, 2) || "VN"
                        : "..."}
                    </span>
                  </div>
                }
              >
                <img
                  src={product().images[currentImageIndex()]}
                  alt={product()?.name}
                  class="w-full h-full object-cover cursor-pointer"
                  onClick={nextImage}
                />
              </Show>
            </div>

            {/* Non-transitioning UI overlays */}
            <Show when={query.isSuccess && product()?.images?.length > 1}>
              <div class="absolute inset-0 z-20 flex items-center justify-between p-4 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  class="bg-white/80 p-2 hover:bg-white text-black transition-colors backdrop-blur-sm pointer-events-auto"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  class="bg-white/80 p-2 hover:bg-white text-black transition-colors backdrop-blur-sm pointer-events-auto"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
              <div class="absolute bottom-4 right-4 z-20 bg-white/80 px-2 py-1 text-xs font-bold font-mono backdrop-blur-sm text-black">
                {currentImageIndex() + 1} / {product().images.length}
              </div>
            </Show>
          </div>
        </div>

        {/* Right: Info */}
        <div class="flex flex-col justify-between p-8 md:p-12 lg:p-16 font-mono border-l border-black">
          <Show when={query.isLoading}>
            <div class="flex h-full items-center justify-center py-20">
              <Loader2 class="animate-spin text-black" size={32} />
            </div>
          </Show>

          <Show when={query.isError}>
            <div class="text-red-600 uppercase text-xs">
              Error: {query.error.message}
            </div>
          </Show>

          <Show when={query.isSuccess}>
            <div class="space-y-8">
              <div class="space-y-2">
                <span class="text-sm font-bold uppercase text-gray-400 tracking-widest">
                  {product().category?.name}
                </span>
                <div>
                  <h1 class="text-5xl font-black uppercase inline [box-decoration-break:clone] [-webkit-box-decoration-break:clone] bg-black text-white">
                    {product().name}
                  </h1>
                </div>
                <p class="text-2xl font-bold text-black font-mono">
                  ${Number(product().price).toFixed(2)}
                </p>
              </div>

              <div class="text-sm leading-relaxed text-gray-600 max-w-md italic">
                {product().shortDescription || "Brief overview unavailable."}
              </div>

              <div class="flex flex-col gap-4 py-6 border-t border-gray-100">
                <For each={groupedAttributes().top}>
                  {(av) => (
                    <div class="flex justify-between items-baseline border-b border-gray-50 pb-1">
                      <span class="text-[10px] font-bold uppercase text-gray-400">
                        {av.attribute?.name}
                      </span>
                      <span class="text-sm font-bold text-black">
                        {getValue(av)}
                      </span>
                    </div>
                  )}
                </For>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product().stock === 0}
              class="w-full bg-black text-white py-5 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed mt-8"
            >
              {product().stock === 0 ? "Sold Out" : "Add to Cart"}
            </button>
          </Show>
        </div>
      </div>

      <Show when={query.isSuccess}>
        <div class="mt-20 border-t border-black pt-12 pb-24 px-8 md:px-12 lg:px-16 font-mono">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div class="md:col-span-2">
              <h2 class="text-xs font-bold uppercase tracking-widest text-black mb-8">
                Detailed Specifications
              </h2>
              <div class="grid grid-cols-2 gap-x-12 gap-y-6">
                <For each={groupedAttributes().bottom}>
                  {(av) => (
                    <div class="border-b border-gray-100 pb-2">
                      <span class="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                        {av.attribute?.name}
                      </span>
                      <span class="text-sm font-medium text-black">
                        {getValue(av)}
                      </span>
                    </div>
                  )}
                </For>
              </div>
            </div>

            <div>
              <h2 class="text-xs font-bold uppercase tracking-widest text-black mb-8">
                Product Story
              </h2>
              <div class="text-sm leading-loose text-gray-700">
                <pre class="text-wrap whitespace-pre-wrap font-mono">
                  {product().description || "Detailed description unavailable."}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
