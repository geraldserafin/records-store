import { createResource, For, Show } from 'solid-js';
import api from '../lib/api';

const fetchOrder = async (id) => {
  return await api.get(`purchases/orders/${id}`).json();
};

export default function OrderDetails(props) {
  const [order] = createResource(() => props.params.id, fetchOrder);

  return (
    <Show when={order()}>
      <div class="flex flex-col">
        <h1>Order #{order().id}</h1>
        <p>Total: ${order().totalAmount}</p>
        <p>Shipping to: {order().shippingName}, {order().shippingCity}</p>
        
        <section>
          <h2>Items</h2>
          <ul>
            <For each={order().items}>
              {(item) => (
                <li>
                  {item.record?.name || 'Unknown Record'} x {item.quantity} - ${item.priceAtPurchase}
                </li>
              )}
            </For>
          </ul>
        </section>
      </div>
    </Show>
  );
}