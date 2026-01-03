import { A, useNavigate, useSearchParams } from "@solidjs/router";
import { Show, createSignal, createResource, For } from "solid-js";
import CartButton from "../features/cart/CartButton";
import UserMenu from "../features/auth/UserMenu";
import { authStore } from "../features/auth/auth.store";
import { api } from "../lib/api";
import { Search } from "lucide-solid";
import { cn } from "../lib/utils";

const fetchCategories = async () => await api.get("categories").json();

export default function Header(props) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [categories] = createResource(fetchCategories);
  const [searchValue, setSearchValue] = createSignal("");

  const leafCategories = () => {
    const cats = categories() || [];
    // A category is a leaf if its ID is not used as a parentId by any other category
    return cats.filter(
      (cat) => !cats.some((child) => child.parentId === cat.id),
    );
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      navigate(`/?search=${searchValue()}`);
    }
  };

  return (
    <header class="mb-12">
      <ul class="list-none p-0 m-0 flex flex-wrap gap-x-8 gap-y-2 items-center border-b border-black pb-4">
        <li class="font-bold text-lg">
          <A href="/" class="text-black no-underline">
            Vinyl Store
          </A>
        </li>
        <li>
          <A
            href="/"
            class={cn(
              "no-underline",
              !searchParams.categoryId && "font-bold underline",
            )}
          >
            All products
          </A>
        </li>
        <For each={leafCategories()}>
          {(cat) => (
            <li>
              <A
                href={`/?categoryId=${cat.id}`}
                class={cn(
                  "no-underline",
                  searchParams.categoryId === String(cat.id) &&
                    "font-bold underline",
                )}
              >
                {cat.name}
              </A>
            </li>
          )}
        </For>
        <li class="ml-auto flex items-center gap-2">
          <span class="opacity-30">Search:</span>
          <input
            type="text"
            placeholder="..."
            class="input w-32"
            value={searchValue()}
            onInput={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearch}
          />
        </li>
        <li>
          <UserMenu />
        </li>
        <li>
          <CartButton onClick={props.onCartClick} />
        </li>
        <Show when={authStore.state.user?.role === "admin"}>
          <li>
            <A
              href="/admin"
              class="text-(--accent-color) font-bold no-underline hover:underline"
            >
              Admin
            </A>
          </li>
        </Show>
      </ul>
    </header>
  );
}
