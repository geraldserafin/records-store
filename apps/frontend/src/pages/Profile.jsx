import { createResource, For, Show } from "solid-js";
import { A, useParams } from "@solidjs/router";
import api from "../lib/api";
import userStore from "../lib/user";

const fetchProfileData = async ({ sourceId, currentUser }) => {
  let targetId = sourceId;

  if (!targetId) {
    if (currentUser) {
      targetId = currentUser.id;
    } else {
      return { user: null };
    }
  }

  const isOwn = currentUser && Number(currentUser.id) === Number(targetId);
  
  let userProfile = isOwn ? currentUser : null;
  
  const promises = [
    api.get("reviews", { searchParams: { userId: targetId } }).json(),
    api.get(`purchases/collection/${targetId}`).json()
  ];

  if (!isOwn) {
    promises.unshift(api.get(`users/${targetId}`).json());
  }

  const results = await Promise.all(promises);
  
  let reviews, collection;
  
  if (!isOwn) {
    userProfile = results[0];
    reviews = results[1];
    collection = results[2];
  } else {
    reviews = results[0];
    collection = results[1];
  }

  let orders = [];
  if (isOwn) {
    try {
      orders = await api.get("purchases/orders").json();
    } catch (e) {
      console.error("Failed to fetch orders", e);
    }
  }

  return { 
    user: userProfile, 
    reviews: reviews?.items || [], 
    collection, 
    orders, 
    isOwn 
  };
};

export default function Profile() {
  const params = useParams();
  // Pass both params.id and current user state to trigger re-fetch when either changes
  const [data] = createResource(
    () => ({ sourceId: params.id, currentUser: userStore.user() }), 
    fetchProfileData
  );

  return (
    <div class="p-4 flex flex-col gap-8">
      <Show when={data.loading}>
        <div>Loading profile...</div>
      </Show>

      <Show when={!data.loading && !data()?.user}>
        <div>
          <p>Please <a href={`${import.meta.env.VITE_API_URL}/auth/google`} class="underline">log in</a> to view your profile.</p>
        </div>
      </Show>

      <Show when={data()?.user}>
        <section class="border-b border-black pb-2">
          <h1>
            {data().user.firstName} {data().user.lastName}
          </h1>
          <Show when={data().isOwn}>
            <p>{data().user.email}</p>
          </Show>
        </section>

        <section class="flex flex-col gap-4">
          <h2 class="border-b border-black">Collection</h2>
          <Show when={data().collection.length > 0} fallback={<p>No records in collection.</p>}>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <For each={data().collection}>
                {(record) => (
                  <A href={`/record/${record.id}`} class="flex flex-col gap-1 no-underline text-black">
                    <img 
                      src={record.images?.[0]} 
                      alt={record.name} 
                      class="aspect-square w-full object-cover border border-black"
                    />
                    <div>
                      <h3>{record.name}</h3>
                      <p>{record.mainArtist?.name}</p>
                    </div>
                  </A>
                )}
              </For>
            </div>
          </Show>
        </section>

        <section class="flex flex-col gap-4">
          <h2 class="border-b border-black">Reviews</h2>
          <Show when={data().reviews.length > 0} fallback={<p>No reviews yet.</p>}>
            <div class="flex flex-col border border-black divide-y divide-black">
              <For each={data().reviews}>
                {(review) => (
                  <div class="p-4 flex flex-col gap-2">
                    <div class="flex justify-between">
                      <span class="font-bold">{review.score}/10</span>
                      <A href={`/record/${review.record.id}`} class="underline">
                        {review.record.name}
                      </A>
                    </div>
                    <p>{review.description}</p>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </section>

        <Show when={data().isOwn && data().orders}>
          <section class="flex flex-col gap-4">
            <h2 class="border-b border-black">Orders</h2>
            <Show when={data().orders.length > 0} fallback={<p>No orders found.</p>}>
              <ul class="flex flex-col border border-black divide-y divide-black">
                <For each={data().orders}>
                  {(order) => (
                    <li class="p-4 flex flex-col gap-4">
                      <div class="flex justify-between items-start">
                        <div class="flex flex-col">
                          <A href={`/order/${order.id}`} class="underline text-black">Order #{order.id}</A>
                          <span>{new Date(order.createdAt).toLocaleString()}</span>
                        </div>
                        <div class="flex flex-col items-end">
                          <span>${order.totalAmount.toFixed(2)}</span>
                          <span class="border border-black px-1 mt-1">
                            {order.status}
                          </span>
                        </div>
                      </div>
                      
                      <div class="flex flex-col gap-1">
                        <span>Items:</span>
                        <ul class="flex flex-col gap-1 border-t border-gray-100 pt-1">
                          <For each={order.items}>
                            {(item) => (
                              <li class="flex justify-between">
                                <span>{item.record?.name} (x{item.quantity})</span>
                                <span>${(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
                              </li>
                            )}
                          </For>
                        </ul>
                      </div>
                    </li>
                  )}
                </For>
              </ul>
            </Show>
          </section>
        </Show>
      </Show>
    </div>
  );
}