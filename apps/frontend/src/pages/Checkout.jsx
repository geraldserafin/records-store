import { createResource, createSignal, Show, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";
import api from "../lib/api";
import cart from "../lib/cart";

const fetchMe = async () => {
  try {
    return await api.get("users/me").json();
  } catch (e) {
    return null;
  }
};

export default function Checkout() {
  const [user] = createResource(fetchMe);
  const navigate = useNavigate();

  const [shippingName, setShippingName] = createSignal("");
  const [shippingAddress, setShippingAddress] = createSignal("");
  const [shippingCity, setShippingCity] = createSignal("");
  const [shippingPostalCode, setShippingPostalCode] = createSignal("");
  const [shippingCountry, setShippingCountry] = createSignal("");
  const [guestEmail, setGuestEmail] = createSignal("");

  createEffect(() => {
    const u = user();
    if (u) {
      setShippingName(`${u.firstName || ""} ${u.lastName || ""}`.trim());
      setShippingAddress(u.shippingAddress || "");
      setShippingCity(u.shippingCity || "");
      setShippingPostalCode(u.shippingPostalCode || "");
      setShippingCountry(u.shippingCountry || "");
      setGuestEmail(u.email || "");
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const orderData = {
      items: cart.state.items.map((i) => ({ recordId: i.id, quantity: i.quantity })),
      shippingName: shippingName(),
      shippingAddress: shippingAddress(),
      shippingCity: shippingCity(),
      shippingPostalCode: shippingPostalCode(),
      shippingCountry: shippingCountry(),
      guestEmail: guestEmail(),
    };

    try {
      // Save to profile if logged in
      if (user()) {
        await api.patch("users/me", {
          json: {
            shippingAddress: shippingAddress(),
            shippingCity: shippingCity(),
            shippingPostalCode: shippingPostalCode(),
            shippingCountry: shippingCountry(),
          },
        });
      }

      const res = await api.post("purchases", { json: orderData }).json();
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (err) {
      console.error("Checkout failed", err);
      alert("Checkout failed. Please try again.");
    }
  };

  return (
    <div class="p-4">
      <h1>Checkout</h1>
      <Show when={cart.state.items.length === 0}>
        <p>Your cart is empty. <button onClick={() => navigate("/")}>Go shop</button></p>
      </Show>

      <Show when={cart.state.items.length > 0}>
        <form onSubmit={handleSubmit} class="flex flex-col gap-4 max-w-md">
          <div class="flex flex-col">
            <label>Email</label>
            <input 
              type="email" 
              value={guestEmail()} 
              onInput={(e) => setGuestEmail(e.target.value)} 
              required 
              disabled={!!user()}
            />
          </div>

          <div class="flex flex-col">
            <label>Full Name</label>
            <input 
              type="text" 
              value={shippingName()} 
              onInput={(e) => setShippingName(e.target.value)} 
              required 
            />
          </div>

          <div class="flex flex-col">
            <label>Address</label>
            <input 
              type="text" 
              value={shippingAddress()} 
              onInput={(e) => setShippingAddress(e.target.value)} 
              required 
            />
          </div>

          <div class="flex flex-col">
            <label>City</label>
            <input 
              type="text" 
              value={shippingCity()} 
              onInput={(e) => setShippingCity(e.target.value)} 
              required 
            />
          </div>

          <div class="flex flex-col">
            <label>Postal Code</label>
            <input 
              type="text" 
              value={shippingPostalCode()} 
              onInput={(e) => setShippingPostalCode(e.target.value)} 
              required 
            />
          </div>

          <div class="flex flex-col">
            <label>Country</label>
            <input 
              type="text" 
              value={shippingCountry()} 
              onInput={(e) => setShippingCountry(e.target.value)} 
              required 
            />
          </div>

          <div class="mt-4 border-t pt-4">
            <p class="text-xl font-bold">Total: ${cart.total().toFixed(2)}</p>
            <button type="submit" class="mt-2 bg-black text-white p-2">
              Pay with Stripe
            </button>
          </div>
        </form>
      </Show>
    </div>
  );
}
