import { authStore } from "../features/auth/auth.store";
import { Show } from "solid-js";
import { useNavigate } from "@solidjs/router";

export default function Profile() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const success = await authStore.logout();
    if (success) {
      navigate("/");
    }
  };

  return (
    <div class="max-w-4xl mx-auto py-8">
      <Show
        when={authStore.state.user}
        fallback={
          <div class="text-center py-32 border border-black border-dashed font-mono">
            <p class="text-gray-500 mb-6 text-sm uppercase">
              Access Restricted
            </p>
            <button
              onClick={authStore.login}
              class="bg-black text-white px-8 py-4 text-sm font-bold uppercase hover:bg-gray-800 transition-colors"
            >
              Login
            </button>
          </div>
        }
      >
        <div class="space-y-12">
          {/* Compact User Header */}
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-6">
              <div class="w-16 h-16 border border-black bg-gray-100 overflow-hidden shrink-0">
                <Show
                  when={authStore.state.user.photoUrl}
                  fallback={<div class="w-full h-full bg-black" />}
                >
                  <img
                    src={authStore.state.user.photoUrl}
                    alt="Profile"
                    class="w-full h-full object-cover"
                  />
                </Show>
              </div>
              <div>
                <h1 class="text-lg font-bold uppercase font-mono leading-none mb-1">
                  {authStore.state.user.firstName}{" "}
                  {authStore.state.user.lastName}
                </h1>
                <p class="text-xs font-mono text-gray-500 uppercase">
                  {authStore.state.user.email}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              class="text-[10px] font-bold uppercase tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-all font-mono"
            >
              Logout
            </button>
          </div>

          {/* Order History (Main Focus) */}
          <div class="space-y-6">
            <div class="flex items-baseline justify-between border-b border-black pb-2">
              <h2 class="text-xs font-bold uppercase font-mono tracking-widest text-black">
                Order History
              </h2>
              <span class="text-[10px] font-mono text-gray-400 uppercase">
                Archive
              </span>
            </div>

            <div class="min-h-[400px]">
              {/* Placeholder for orders list */}
              <div class="border border-gray-100 p-12 text-center">
                <p class="text-gray-400 font-mono text-xs uppercase tracking-widest">
                  No transaction history found.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
