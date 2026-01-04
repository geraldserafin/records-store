import { createSignal, Show } from "solid-js";
import Sidebar from "./Sidebar";

export default function Layout(props) {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <div class="size-full bg-gray-200 shop-theme backdrop-blur-3xl">
      <div class="container mx-auto flex items-startrelative h-screen overflow-hidden py-4">
        <div class="md:hidden sticky top-8 z-50 mr-2">
          <button
            onClick={() => setIsOpen(!isOpen())}
            class="bg-white border px-2 py-1 shadow-sm"
          >
            {isOpen() ? "Close" : "Menu"}
          </button>
        </div>

        <Show when={isOpen()}>
          <div
            class="fixed inset-0 z-40 bg-black/5 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        </Show>

        <aside
          class={`
            ${isOpen() ? "fixed top-20 left-0 h-min max-h-[calc(100vh-6rem)] w-48 z-50 bg-white overflow-y-auto border" : "hidden"} 
            md:flex md:flex-col md:gap-4 md:border md:h-full md:w-48

          `}
        >
          <Sidebar />
        </aside>

        <main class="border bg-white -ml-px flex-1 h-full overflow-y-auto">
          {props.children}
        </main>
      </div>
    </div>
  );
}
