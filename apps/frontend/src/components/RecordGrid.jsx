import { For, Show } from "solid-js";
import { A } from "@solidjs/router";

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3)
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];

  return [1, "...", current - 1, current, current + 1, "...", total];
}

export default function RecordGrid(props) {
  return (
    <div class="relative min-h-full flex flex-col">
      <div class="grid md:grid-cols-3 sm:grid-cols-2 bg-white gap-3 p-3 flex-1">
        <For each={props.records}>
          {(record) => (
            <div class="border">
              <A
                href={`/record/${record.id}`}
                state={{ image: record.images?.[0] }}
                class="block !no-underline text-black"
              >
                <div class="aspect-square w-full overflow-hidden">
                  <img
                    src={record.images?.[0]}
                    alt={record.name}
                    class="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div class="flex flex-col p-2">
                  <h3 class="font-bold">{record.name}</h3>
                  <span class="text-sm">
                    by <span class="underline">{record.mainArtist?.name}</span>
                  </span>
                  <p class="mt-2 font-bold">${record.price}</p>
                </div>
              </A>
            </div>
          )}
        </For>
        <Show when={props.records?.length === 0}>
          <div class="col-span-full p-8 text-center text-gray-500">
            No records found.
          </div>
        </Show>
      </div>

      <Show when={props.meta && props.meta.totalPages > 1}>
        <div class="sticky bottom-0 bg-transparent backdrop-blur-3xl px-4 py-2 flex justify-center gap-2 z-10">
          <button
            disabled={props.page === 1}
            onClick={() => props.onPageChange(props.page - 1)}
            class="px-3 py-1 border border-black disabled:opacity-50 hover:bg-black hover:text-white transition-colors"
          >
            -
          </button>

          <For each={getPageNumbers(props.page, props.meta.totalPages)}>
            {(p) => (
              <button
                disabled={p === "..."}
                onClick={() => typeof p === "number" && props.onPageChange(p)}
                class={`px-3 py-1 border border-black min-w-[32px] 
                  ${props.page === p ? "bg-black text-white" : "hover:bg-gray-100"}
                  ${p === "..." ? "border-none cursor-default hover:bg-transparent" : "cursor-pointer"}
                `}
              >
                {p}
              </button>
            )}
          </For>

          <button
            disabled={props.page >= props.meta.totalPages}
            onClick={() => props.onPageChange(props.page + 1)}
            class="px-3 py-1 border border-black disabled:opacity-50 hover:bg-black hover:text-white transition-colors"
          >
            +
          </button>
        </div>
      </Show>
    </div>
  );
}
