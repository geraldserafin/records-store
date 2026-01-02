import { useNavigate } from "@solidjs/router";
import { createEffect, Show } from "solid-js";
import { authStore } from "../features/auth/auth.store";
import { Loader2 } from "lucide-solid";
import NotFound from "../pages/NotFound"; // I should create this file properly

export default function AdminRoute(props) {
  const isAdmin = () => authStore.state.user?.role === 'admin';

  return (
    <Show when={!authStore.state.loading} fallback={
      <div class="h-screen w-full flex items-center justify-center">
        <Loader2 class="animate-spin text-indigo-600" size={32} />
      </div>
    }>
      <Show when={isAdmin()} fallback={<NotFound />}>
        {props.children}
      </Show>
    </Show>
  );
}
