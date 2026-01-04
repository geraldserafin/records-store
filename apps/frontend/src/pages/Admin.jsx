import { createSignal, createResource, Show, Switch, Match, onMount } from "solid-js";
import api from "../lib/api";
import userStore from "../lib/user";
import { useNavigate } from "@solidjs/router";
import { Package, Mic2, Disc, LayoutDashboard } from "lucide-solid";
import RecordManager from "../components/admin/RecordManager";
import ArtistManager from "../components/admin/ArtistManager";
import GenreManager from "../components/admin/GenreManager";

const fetchGenres = () => api.get("genres").json();
const fetchArtists = () => api.get("artists").json();
const fetchRecords = () => api.get("records?limit=100").json();

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = createSignal("records");
  const [genres, { refetch: refetchGenres }] = createResource(fetchGenres);
  const [artists, { refetch: refetchArtists }] = createResource(fetchArtists);
  const [records, { refetch: refetchRecords }] = createResource(fetchRecords);

  onMount(() => {
    // Basic protection
    if (userStore.user.loading) return;
    if (!userStore.user() || userStore.user()?.role !== "admin") {
      navigate("/");
    }
  });

  return (
    <Show when={userStore.user()?.role === "admin"}>
      <div class="min-h-screen bg-gray-50/50">
        <div class="max-w-6xl mx-auto px-6 py-8">
          <div class="flex flex-col md:flex-row gap-8">
            {/* Sidebar Navigation */}
            <aside class="w-full md:w-64 shrink-0 space-y-2 sticky top-6 z-10 self-start">
              <div class="mb-8 px-4">
                <h1 class="text-xl font-bold flex items-center gap-2 text-gray-900">
                  <LayoutDashboard size={24} />
                  Dashboard
                </h1>
                <p class="text-sm text-gray-500 mt-1">Manage your store content</p>
              </div>
              
              <nav class="space-y-1">
                <button
                  onClick={() => setActiveTab("records")}
                  class={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                    activeTab() === "records" 
                      ? "bg-white text-black shadow-sm ring-1 ring-black/5" 
                      : "text-gray-600 hover:bg-white/50 hover:text-black"
                  }`}
                >
                  <Disc size={18} />
                  Records
                </button>
                <button
                  onClick={() => setActiveTab("artists")}
                  class={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                    activeTab() === "artists" 
                      ? "bg-white text-black shadow-sm ring-1 ring-black/5" 
                      : "text-gray-600 hover:bg-white/50 hover:text-black"
                  }`}
                >
                  <Mic2 size={18} />
                  Artists
                </button>
                <button
                  onClick={() => setActiveTab("genres")}
                  class={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                    activeTab() === "genres" 
                      ? "bg-white text-black shadow-sm ring-1 ring-black/5" 
                      : "text-gray-600 hover:bg-white/50 hover:text-black"
                  }`}
                >
                  <Package size={18} />
                  Genres
                </button>
              </nav>
            </aside>

            {/* Main Content Area */}
            <main class="flex-1 min-w-0">
              <Switch>
                <Match when={activeTab() === "records"}>
                  <RecordManager 
                    records={records()} 
                    artists={artists()} 
                    genres={genres()} 
                    refetch={refetchRecords} 
                  />
                </Match>
                <Match when={activeTab() === "artists"}>
                  <ArtistManager 
                    artists={artists()} 
                    refetch={refetchArtists} 
                  />
                </Match>
                <Match when={activeTab() === "genres"}>
                  <GenreManager 
                    genres={genres()} 
                    refetch={refetchGenres} 
                  />
                </Match>
              </Switch>
            </main>
          </div>
        </div>
      </div>
    </Show>
  );
}