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
    <div class="w-full font-mono">
      <Show when={query.isLoading && !query.data}>
        <div class="flex h-64 w-full items-center justify-center">
          <span class="text-xs font-bold uppercase tracking-widest animate-pulse">Scanning inventory...</span>
        </div>
      </Show>

      <Show when={query.isError}>
        <div class="border border-red-500 p-4 text-red-500 text-xs uppercase mb-8">
          Error: {query.error?.message || "Unknown retrieval error"}
        </div>
      </Show>

      <Show when={query.data}>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
          <For each={query.data.pages}>
            {(page) => (
              <For each={page.items}>
                {(product) => <ProductCard product={product} />}
              </For>
            )}
          </For>
        </div>
        
        <Show when={query.data.pages[0]?.items?.length === 0}>
          <div class="py-24 text-center">
            <p class="text-gray-400 text-xs font-bold uppercase tracking-widest">No matching units found.</p>
          </div>
        </Show>

        <div ref={setLoadMoreRef} class="h-24 w-full flex items-center justify-center mt-12">
          <Show when={query.isFetchingNextPage}>
            <span class="text-xs font-bold uppercase tracking-widest animate-pulse">Retrieving more data...</span>
          </Show>
        </div>
      </Show>
    </div>
  );
}
