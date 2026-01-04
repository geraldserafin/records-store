import { For, Show } from "solid-js";
import { Loader2 } from "lucide-solid";

export function Table(props) {
  return (
    <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-gray-50 text-gray-600 border-b border-gray-200">
            <tr>
              <For each={props.columns}>
                {(col) => (
                  <th class={`px-6 py-3 font-medium ${col.class || ""}`}>
                    {col.header}
                  </th>
                )}
              </For>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <Show when={!props.loading} fallback={
              <tr>
                <td colspan={props.columns.length} class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center justify-center text-gray-400">
                    <Loader2 size={24} class="animate-spin mb-2" />
                    <span>Loading data...</span>
                  </div>
                </td>
              </tr>
            }>
              <For each={props.data}>
                {(item) => (
                  <tr class="hover:bg-gray-50/50 transition-colors">
                    <For each={props.columns}>
                      {(col) => (
                        <td class={`px-6 py-4 ${col.class || ""}`}>
                          {col.cell ? col.cell(item) : item[col.accessor]}
                        </td>
                      )}
                    </For>
                  </tr>
                )}
              </For>
              <Show when={props.data?.length === 0}>
                <tr>
                  <td colspan={props.columns.length} class="px-6 py-12 text-center text-gray-500">
                    {props.emptyText || "No records found"}
                  </td>
                </tr>
              </Show>
            </Show>
          </tbody>
        </table>
      </div>
    </div>
  );
}
