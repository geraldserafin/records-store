import { authStore } from "../features/auth/auth.store";
import { Show, For } from "solid-js";
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
    <div class="max-w-2xl space-y-12 font-sans">
      <Show
        when={authStore.state.user}
        fallback={
          <div class="py-8">
            <p class="opacity-30 mb-4">Identity record missing.</p>
            <button
              onClick={authStore.login}
              class="bg-black text-white px-4 py-1 font-bold"
            >
              Access system
            </button>
          </div>
        }
      >
        <div class="space-y-12">
          <div class="space-y-4">
            <h1 class="font-bold text-lg border-b border-black">
              Profile record
            </h1>

            <div class="space-y-6">
              <Show when={authStore.state.user.photoUrl}>
                <img
                  src={authStore.state.user.photoUrl}
                  class="w-24 h-24 bg-gray-200"
                />
              </Show>

              <ul class="list-none p-0 m-0 space-y-1 text-sm">
                <li>
                  <span class="opacity-40">User:</span>{" "}
                  {authStore.state.user.firstName}{" "}
                  {authStore.state.user.lastName}
                </li>
                <li>
                  <span class="opacity-40">Mail:</span>{" "}
                  {authStore.state.user.email}
                </li>
                <li>
                  <span class="opacity-40">Rank:</span>{" "}
                  {authStore.state.user.role || "Member"}
                </li>
                <li class="pt-4">
                  <button onClick={handleLogout} class="text-red-600 underline">
                    Log Out➾
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* HISTORY */}
          <div class="space-y-4">
            <h2 class="font-bold border-b border-black">Historical data</h2>
            <div class="text-gray-500 italic">
              No purchase logs encountered.
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
