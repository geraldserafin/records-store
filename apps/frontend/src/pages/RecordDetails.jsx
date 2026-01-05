import { createResource, createSignal, For, Show } from "solid-js";
import api from "../lib/api";
import { A, useNavigate, useLocation, useParams } from "@solidjs/router";
import cart from "../lib/cart";
import userStore from "../lib/user";

const fetchRecord = async (id) => {
  return await api.get(`records/${id}`).json();
};

const fetchReviews = async (recordId) => {
  return await api.get('reviews', { searchParams: { recordId } }).json();
};

export default function RecordDetails() {
  const params = useParams();
  const [record] = createResource(() => params.id, fetchRecord);
  const [reviews, { refetch: refetchReviews }] = createResource(() => params.id, fetchReviews);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const [score, setScore] = createSignal(10);
  const [desc, setDesc] = createSignal("");
  const [submitting, setSubmitting] = createSignal(false);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("reviews", { 
        json: { 
          recordId: Number(params.id), 
          score: Number(score()), 
          description: desc() 
        } 
      });
      setDesc("");
      setScore(10);
      refetchReviews();
    } catch (err) {
      alert("Failed to post review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div class="p-4 flex flex-col gap-6">
      <div class="border-b border-black pb-2">
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
        class="aspect-square object-cover w-64 border border-black"
      />

      <Show when={record()}>
        <div class="flex flex-col gap-4">
          <div>
            <h1>
              {record().name} by{" "}
              <A href={`/artists/${record().mainArtist.slug}`} class="underline">
                {record().mainArtist.name}
              </A>
              <Show when={record().coArtists?.length > 0}>
                {" & "}
                <For each={record().coArtists}>
                  {(artist) => (
                    <span>
                      <A href={`/artists/${artist.slug}`} class="underline">{artist.name}</A>
                      {", "}
                    </span>
                  )}
                </For>
              </Show>
            </h1>
            <p>{record().shortDescription}</p>
          </div>

          <h2>Price: ${record().price}</h2>

          <div class="flex gap-2 items-center">
            <button class="border border-black px-4 py-1" onClick={() => cart.addToCart(record())}>Add to cart</button>
            <span>({record().stock} in stock)</span>
          </div>

          <p class="max-w-prose">{record().description}</p>

          <div>
            <h3>Genres</h3>
            <p>
              {record()
                .genres.map((g) => g.name)
                .join(", ")}
            </p>
          </div>

          <Show when={record().images.length > 1}>
            <div class="flex gap-2 overflow-x-auto border-t border-black pt-4">
              <For each={record().images.slice(1)}>
                {(image) => (
                  <img
                    src={image}
                    alt={record().name}
                    class="w-32 h-32 object-cover border border-black"
                  />
                )}
              </For>
            </div>
          </Show>
          
          {/* Reviews Section */}
          <section class="border-t border-black pt-4 flex flex-col gap-4">
            <h3>Reviews</h3>
            
            <Show when={userStore.user()}>
              <form onSubmit={handleSubmitReview} class="flex flex-col gap-2 max-w-md border border-black p-4">
                <h4>Write a review</h4>
                <div class="flex gap-2 items-center">
                  <label>Score (1-10):</label>
                  <input 
                    type="number" min="1" max="10" 
                    value={score()} 
                    onInput={(e) => setScore(e.target.value)}
                    class="border border-black w-16 p-1"
                  />
                </div>
                <textarea 
                  value={desc()} 
                  onInput={(e) => setDesc(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows="3"
                  class="border border-black p-2 w-full"
                />
                <button type="submit" disabled={submitting()} class="bg-black text-white p-2 self-start border border-black hover:bg-white hover:text-black transition-colors">
                  Submit Review
                </button>
              </form>
            </Show>
            
            <Show when={!userStore.user()}>
              <p>Please <a href={`${import.meta.env.VITE_API_URL}/auth/google`} class="underline">log in</a> to write a review.</p>
            </Show>

            <div class="flex flex-col gap-4">
              <For each={reviews()?.items}>
                {(review) => (
                  <div class="border-b border-gray-200 pb-2 last:border-0">
                    <div class="flex justify-between">
                      <span class="font-bold">{review.score}/10</span>
                      <Show when={review.author} fallback={<span class="text-gray-500">Unknown User</span>}>
                        <A href={`/profile/${review.author.id}`} class="underline">{review.author.firstName || "User"}</A>
                      </Show>
                    </div>
                    <p class="mt-1">{review.description}</p>
                  </div>
                )}
              </For>
              <Show when={reviews()?.items.length === 0}>
                <p>No reviews yet.</p>
              </Show>
            </div>
          </section>
        </div>
      </Show>
    </div>
  );
}