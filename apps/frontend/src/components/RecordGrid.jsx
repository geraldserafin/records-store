import { createResource, createSignal, For, Show } from "solid-js";
import { A } from "@solidjs/router";
import api from "../lib/api";

const fetchRecords = async ({ page, genre, section, q }) => {
  const searchParams = new URLSearchParams({
    page: page.toString(),
    limit: "20",
  });

  if (genre) searchParams.append("genreSlug", genre);
  if (section) searchParams.append("section", section);
  if (q) {
    const res = await api
      .get(`records/search`, { searchParams: { q, page, limit: "12" } })
      .json();
    return res;
  }

  return await api.get("records", { searchParams }).json();
};

export default function RecordGrid(props) {
  const [page, setPage] = createSignal(1);
  const [data] = createResource(
    () => ({
      page: page(),
      genre: props.genre,
      section: props.section,
      q: props.q,
    }),
    fetchRecords,
  );

  return (
    <div>
      <div class="grid grid-cols-3 bg-white">
        <For each={data()?.items}>
          {(record) => (
            <A
              href={`/record/${record.id}`}
              state={{ image: record.images?.[0] }}
              class="border-r border-b border-black"
            >
              <img
                src={record.images?.[0]}
                alt={record.name}
                class="aspect-square w-full object-cover"
              />
              <h3>
                {record.name} by {record.mainArtist?.name}
              </h3>
              <p class="m-0">${record.price}</p>
            </A>
          )}
        </For>
      </div>

      <Show when={data()?.meta}>
        <div>
          <button disabled={page() === 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </button>
          <span>
            Page {page()} of {data().meta.totalPages}
          </span>
          <button
            disabled={page() === data().meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </Show>
    </div>
  );
}
