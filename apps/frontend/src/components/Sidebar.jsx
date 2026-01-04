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
    <div class="flex flex-col gap-3 h-full bg-white p-2 overflow-x-hidden">
      <img
        class="scale-150 mt-8"
        src="https://assets.bigcartel.com/theme_images/62869080/wleps+stara+TONFA+plonanca.png?auto=format&fit=max&h=1508&w=1508"
      />

      <h1 class="font-bold font-serif text-center w-full">BIGA* RECORDS</h1>

      <form onSubmit={handleSearch} class="flex w-full">
        <input
          ref={searchInput}
          type="search"
          placeholder="Search..."
          class="w-full box-border"
        />
      </form>

      <nav class="flex flex-col">
        <h3>Genres</h3>
        <ul>
          <For each={genres()}>
            {(genre) => (
              <li>
                <A href={`/genres/${genre.slug}`}>{genre.name}</A>
              </li>
            )}
          </For>
        </ul>
      </nav>

      <Cart />

      <Show
        when={userStore.user()}
        fallback={
          <a href="http://localhost:1000/auth/google">Sign in with Google</a>
        }
      >
        <section class="space-y-3">
          <Show when={userStore.user()?.role === "admin"}>
            <div>
              <A href="/admin">Admin Panel</A>
            </div>
          </Show>

          <div>
            <A href="/profile">Your Profile</A>
          </div>

          <button
            class="text-left text-red-600 hover:text-red-800"
            onClick={async () => {
              await api.get("auth/logout");
              window.location.href = "/";
            }}
          >
            Logout
          </button>
        </section>
      </Show>
    </div>
  );
}
