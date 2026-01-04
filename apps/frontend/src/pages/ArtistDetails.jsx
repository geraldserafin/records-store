import { createResource, For, Show } from "solid-js";
import { useParams, A, useNavigate } from "@solidjs/router";
import api from "../lib/api";

const fetchArtist = async (slug) => {
  return await api.get(`artists/slug/${slug}`).json();
};

function RecordItem(props) {
  return (
    <A href={`/record/${props.record.id}`}>
      <div class="border flex flex-row gap-4 no-underline">
        <Show when={props.record.images?.[0]}>
          <img
            src={props.record.images[0]}
            alt={props.record.name}
            class="w-48 aspect-square size-full object-cover border border-black"
          />
        </Show>
        <div class="flex flex-col">
          <h3>{props.record.name}</h3>
          <p>{props.record.shortDescription}</p>
          <span>${props.record.price}</span>
        </div>
      </div>
    </A>
  );
}

export default function ArtistDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const [artist] = createResource(() => params.slug, fetchArtist);

  return (
    <div class="p-4 flex flex-col gap-6">
      <div class="border-b border-black pb-2">
        <a
          class="no-underline"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate(-1);
          }}
        >
          ← Back
        </a>
      </div>
      <Show when={artist()} fallback={<div>Loading artist...</div>}>
        <section class="flex flex-col md:flex-row gap-8">
          <Show when={artist().image}>
            <div class="shrink-0">
              <img
                src={artist().image}
                alt={artist().name}
                class="w-full md:w-64 aspect-square object-cover border border-black"
              />
            </div>
          </Show>
          <div class="space-y-2">
            <h1>{artist().name}</h1>
            <p class="max-w-2xl">{artist().bio || "No biography available."}</p>
          </div>
        </section>

        <div class="flex flex-col gap-8">
          <Show when={artist().mainRecords?.length > 0}>
            <section class="flex flex-col gap-2">
              <h2 class="border-b border-black">Discography</h2>
              <For each={artist().mainRecords}>
                {(record) => <RecordItem record={record} />}
              </For>
            </section>
          </Show>

          <Show when={artist().coRecords?.length > 0}>
            <section class="flex flex-col gap-2">
              <h2 class="border-b">Appears on</h2>
              <For each={artist().coRecords}>
                {(record) => <RecordItem record={record} />}
              </For>
            </section>
          </Show>

          <Show
            when={!artist().mainRecords?.length && !artist().coRecords?.length}
          >
            <p>No records found.</p>
          </Show>
        </div>
      </Show>
    </div>
  );
}
