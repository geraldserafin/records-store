import { createInfiniteQuery } from "@tanstack/solid-query";
import { fetchProducts } from "../features/products/products.api";
import ProductCard from "../features/products/ProductCard";
import { createSignal, For, Show, createEffect, onCleanup } from "solid-js";
import { useSearchParams } from "@solidjs/router";

export default function Shop() {
  const [searchParams] = useSearchParams();
  const limit = 12;
  const [loadMoreRef, setLoadMoreRef] = createSignal(null);

  const query = createInfiniteQuery(() => ({
    queryKey: ['products', searchParams.search, searchParams.categoryId],
    queryFn: ({ pageParam = 1 }) => {
      const filters = {};
      if (searchParams.search) filters.name = searchParams.search;
      if (searchParams.categoryId) filters.categoryId = searchParams.categoryId;
      
      const options = { filter: filters };
      return fetchProducts(pageParam, limit, options);
    },
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;
      const totalPages = lastPage.meta?.totalPages || 1;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
  }));

  // Intersection Observer for Infinite Scroll
  createEffect(() => {
    const el = loadMoreRef();
    if (!el) return;
    
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if (query.hasNextPage && !query.isFetchingNextPage) {
          console.log("Loading next page...");
          query.fetchNextPage();
        }
      }
    }, {
      rootMargin: '200px', // Trigger earlier
    });

    observer.observe(el);
    onCleanup(() => observer.disconnect());
  });

  createEffect(() => {
    console.log("Shop Query State:", {
      status: query.status,
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      hasNextPage: query.hasNextPage,
      pages: query.data?.pages?.length,
      search: searchParams.search,
      category: searchParams.categoryId
    });
  });

  return (
    <div class="w-full">
      <Show when={query.isLoading && !query.data}>
        <div class="py-8 text-gray-400 font-bold">
          Loading collection...
        </div>
      </Show>

      <Show when={query.isError}>
        <div class="bg-black text-white p-4 mb-8">
          Status: Critical Error ({query.error?.message})
        </div>
      </Show>

      <Show when={query.data}>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <For each={query.data.pages}>
            {(page) => (
              <For each={page.items}>
                {(product) => <ProductCard product={product} />}
              </For>
            )}
          </For>
        </div>
        
        <Show when={query.data.pages[0]?.items?.length === 0}>
          <div class="py-12 text-center opacity-30 italic">
            Search returned no results.
          </div>
        </Show>

        <div ref={setLoadMoreRef} class="h-24 w-full flex items-center justify-center mt-12 border-t border-black/5">
          <Show when={query.isFetchingNextPage}>
            <span class="font-bold animate-pulse">Requesting more units...</span>
          </Show>
        </div>
      </Show>
    </div>
  );
}
