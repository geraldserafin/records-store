import { createResource, For, Show } from "solid-js";
import api from "../lib/api";
import { A, useNavigate, useLocation, useParams } from "@solidjs/router";
import cart from "../lib/cart";

const fetchRecord = async (id) => {
  return await api.get(`records/${id}`).json();
};

export default function RecordDetails() {
  const params = useParams();
  const [record] = createResource(() => params.id, fetchRecord);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div class="flex flex-col gap-3 p-2">
      <div class="border-b">
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

      <img
        src={record()?.images[0] || location.state?.image}
        class="aspect-square object-cover w-64"
      />

      <Show when={record()}>
        <h1>
          {record().name} by {record().mainArtist.name}
          <Show when={record().coArtists?.length > 0}>
            {" & "}
            <For each={record().coArtists}>
              {(artist) => (
                <span>
                  <A href={`/artists/${artist.slug}`}>{artist.name}</A>
                  {", "}
                </span>
              )}
            </For>
          </Show>
        </h1>
        <p>{record().shortDescription}</p>

        <h2>Price: ${record().price}</h2>

        <div class="flex overflow-x-auto">
          <For each={record().images.slice(1)}>
            {(image) => (
              <img
                src={image}
                alt={record().name}
                class="aspect-square object-cover max-w-64"
              />
            )}
          </For>
        </div>

        <div>
          <button onClick={() => cart.addToCart(record())}>Add to cart</button>
          <p>({record().stock} in stock)</p>
        </div>

        <p>{record().description}</p>

        <div>
          <h2>Other Details</h2>
          <hr />
        </div>

        <div>
          Genres:{" "}
          {record()
            .genres.map((g) => g.name)
            .join(", ")}
        </div>
      </Show>
    </div>
  );
}
