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
    <header class="sticky top-0 z-40 w-full backdrop-blur-xl">
      <div class="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Left: Branding & Categories */}
        <div class="flex items-center gap-8 overflow-x-auto no-scrollbar">
          <A href="/" class="text-lg font-bold shrink-0 uppercase font-mono">
            <span class="bg-black text-white [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
              Vinyl Store
            </span>
          </A>

          <nav class="flex items-center gap-6">
            <A
              href="/"
              class={cn(
                "text-sm font-medium transition-colors whitespace-nowrap font-mono",
                !searchParams.categoryId
                  ? "text-black underline underline-offset-4"
                  : "text-gray-500 hover:text-black",
              )}
            >
              All
            </A>
            <For each={leafCategories()}>
              {(cat) => (
                <A
                  href={`/?categoryId=${cat.id}`}
                  class={cn(
                    "text-sm font-medium transition-colors whitespace-nowrap font-mono",
                    searchParams.categoryId === String(cat.id)
                      ? "text-black underline underline-offset-4"
                      : "text-gray-500 hover:text-black",
                  )}
                >
                  {cat.name}
                </A>
              )}
            </For>
          </nav>
        </div>

        {/* Right: Search & Actions */}
        <div class="flex items-center gap-6 shrink-0 bg-white pl-4">
          <div class="relative flex items-center">
            <input
              type="text"
              placeholder="Search"
              class="w-48 bg-gray-100 rounded-full py-1.5 pl-4 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all"
              value={searchValue()}
              onInput={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearch}
            />
            <Search size={14} class="absolute right-3 text-gray-400" />
          </div>

          <div class="flex items-center gap-4">
            <Show when={authStore.state.user?.role === "admin"}>
              <A
                href="/admin"
                class="text-sm font-medium text-black hover:text-gray-600 transition-colors"
              >
                Admin
              </A>
            </Show>
            <UserMenu />
            <CartButton onClick={props.onCartClick} />
          </div>
        </div>
      </div>
    </header>
  );
}
