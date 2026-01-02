import { A } from "@solidjs/router";
import { Search } from "lucide-solid";

export default function NotFound() {
  return (
    <div class="flex flex-col items-center justify-center py-32 text-center">
      <div class="mb-6 p-4 bg-gray-100 rounded-full text-gray-400">
        <Search size={48} />
      </div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">404 - Page Not Found</h1>
      <p class="text-gray-500 mb-8 max-w-sm">
        The page you are looking for doesn't exist or has been moved to a different universe.
      </p>
      <A 
        href="/" 
        class="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Go Back Home
      </A>
    </div>
  );
}
