import { A } from "@solidjs/router";
import { Disc } from "lucide-solid";

export default function Home() {
  return (
    <div class="flex flex-col items-center justify-center py-20 text-center">
      <div class="mb-8 p-4 bg-indigo-50 rounded-full text-indigo-600">
        <Disc size={64} />
      </div>
      <h1 class="text-4xl font-extrabold tracking-tight sm:text-6xl mb-6 text-gray-900">
        Spin Your World
      </h1>
      <p class="text-xl text-gray-600 max-w-2xl mb-10 leading-relaxed">
        Discover rare classics and modern hits in our curated vinyl collection. 
        High fidelity sound for the true audiophile.
      </p>
      <div class="flex gap-4">
        <A 
          href="/shop" 
          class="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          Browse Collection
        </A>
      </div>
    </div>
  );
}
