import { createResource, For, Show } from "solid-js";
import Cart from "./Cart.jsx";
import { A, useNavigate } from "@solidjs/router";
import api from "../lib/api";
import userStore from "../lib/user";

const fetchGenres = async () => {
  return await api.get("genres").json();
};

export default function Sidebar() {
  const [genres] = createResource(fetchGenres);
  const navigate = useNavigate();

  let searchInput;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.value) {
      navigate(`/search?q=${encodeURIComponent(searchInput.value)}`);
    }
  };

  return (
    <div class="flex flex-col gap-3 bg-white p-2">
      <form onSubmit={handleSearch} class="flex">
        <input ref={searchInput} type="search" placeholder="Search..." />
      </form>

      <nav class="flex flex-col">
        <h3>Genres</h3>
        <ul>
          <For each={genres()}>
            {(genre) => (
              <li>
                <A href={`/genre/${genre.slug}`}>{genre.name}</A>
              </li>
            )}
          </For>
        </ul>
      </nav>

      <nav class="flex flex-col">
        <h3>Discover</h3>
        <ul>
          <li>
            <A href="/section/bestsellers">Bestsellers</A>
          </li>
          <li>
            <A href="/section/classics">Classics</A>
          </li>
          <li>
            <A href="/section/new-arrivals">New Arrivals</A>
          </li>
        </ul>
      </nav>

      <Cart />

      <section>
        <Show
          when={userStore.user()}
          fallback={
            <a href="http://localhost:1000/auth/google">Sign in with Google</a>
          }
        >
          <h4>Your orders</h4>
          <Show
            when={userStore.orders()?.length > 0}
            fallback={<p>No orders</p>}
          >
            <ul>
              <For each={userStore.orders()}>
                {(order) => (
                  <li>
                    <A href={`/order/${order.id}`}>Order #{order.id}</A>
                  </li>
                )}
              </For>
            </ul>
          </Show>

          <div>
            <Show when={userStore.user()?.role === "admin"}>
              <A href="/admin">Admin Panel</A>
            </Show>
          </div>

          <button
            class="mt-4 text-left text-red-600 hover:text-red-800"
            onClick={async () => {
              await api.get("auth/logout");
              window.location.href = "/";
            }}
          >
            Logout
          </button>
        </Show>
      </section>
    </div>
  );
}
