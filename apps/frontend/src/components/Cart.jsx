import { createSignal, Show, For, onCleanup, onMount } from "solid-js";
import { Portal } from "solid-js/web";
import cart from "../lib/cart";
import { useNavigate } from "@solidjs/router";

export default function Cart() {
  const [isOpen, setIsOpen] = createSignal(false);
  const [positionStyle, setPositionStyle] = createSignal({});
  const navigate = useNavigate();
  let buttonRef;
  let dropdownRef;

  const handleGlobalClick = (e) => {
    if (isOpen()) {
      const clickedInButton = buttonRef && buttonRef.contains(e.target);
      const clickedInDropdown = dropdownRef && dropdownRef.contains(e.target);

      if (!clickedInButton && !clickedInDropdown) {
        setIsOpen(false);
      }
    }
  };

  onMount(() => {
    document.addEventListener("mousedown", handleGlobalClick);
  });

  onCleanup(() => {
    document.removeEventListener("mousedown", handleGlobalClick);
  });

  const toggle = () => {
    if (!isOpen() && buttonRef) {
      const rect = buttonRef.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const estimatedHeight = 400; // approximate max height (96 = 24rem = 384px)

      let style = {
        left: `${rect.left}px`,
        width: "16rem", // w-64
      };

      if (spaceBelow < estimatedHeight && rect.top > spaceBelow) {
        // Place above if more space above than below (and below is tight)
        style.bottom = `${viewportHeight - rect.top}px`;
        style.top = "auto";
        style.maxHeight = `${rect.top - 20}px`;
      } else {
        // Place below
        style.top = `${rect.bottom}px`;
        style.bottom = "auto";
        style.maxHeight = `${spaceBelow - 20}px`;
      }
      
      setPositionStyle(style);
    }
    setIsOpen(!isOpen());
  };

  return (
    <div class="relative">
      <button ref={buttonRef} class="appearance-none" onClick={toggle}>
        Cart ({cart.count()})
      </button>

      <Show when={isOpen()}>
        <Portal>
          <div class="shop-theme">
            <div 
              ref={dropdownRef}
              class="bg-white px-2 shadow-lg overflow-auto fixed border pb-3 z-50"
              style={positionStyle()}
            >
              <h2 class="border-b">Cart</h2>
              <For each={cart.state.items}>
                {(item) => {
                  return (
                    <div class="flex flex-col border-b py-2 gap-2">
                      <div class="flex gap-2">
                        <img
                          src={item.images?.[0]}
                          class="w-12 h-12 object-cover"
                        />
                        <div class="flex flex-col">
                          <span>
                            {item.name} by {item.mainArtist?.name}
                          </span>
                          <span>${item.price}</span>
                        </div>
                      </div>
                      <div class="flex gap-2">
                        <button onClick={() => cart.updateQuantity(item.id, -1)}>
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => cart.updateQuantity(item.id, 1)}>
                          +
                        </button>
                        <button onClick={() => cart.removeFromCart(item.id)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                }}
              </For>

              <div class="mt-4 flex flex-col gap-2">
                <p>Total: ${cart.total().toFixed(2)}</p>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/checkout");
                  }}
                  disabled={cart.state.items.length === 0}
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  );
}