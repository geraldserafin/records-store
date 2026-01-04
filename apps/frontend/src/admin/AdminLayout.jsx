import { A, useNavigate } from "@solidjs/router";
import { LayoutDashboard, Users, Music, Disc, LogOut } from "lucide-solid";
import { createEffect, Show } from "solid-js";
import userStore from "../lib/user";

export default function AdminLayout(props) {
  const navigate = useNavigate();

  createEffect(() => {
    // If user is loaded and not admin, redirect
    // We check !loading to ensure we don't redirect while fetching
    if (!userStore.user.loading) {
      const user = userStore.user();
      if (!user || user.role !== "admin") {
        navigate("/");
      }
    }
  });

  // Show nothing or loader while checking
  return (
    <Show when={userStore.user()?.role === "admin"}>
      <div class="flex h-screen bg-gray-50 text-gray-900 font-sans">
        {/* Sidebar */}
        <aside class="w-64 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 left-0 z-10">
          <div class="h-16 flex items-center px-6 border-b border-gray-100">
            <span class="text-lg font-bold tracking-tight">Admin Panel</span>
          </div>

          <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
            <NavLink href="/admin" end>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>

            <div class="pt-4 pb-2 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Content
            </div>

            <NavLink href="/admin/artists">
              <Users size={20} />
              <span>Artists</span>
            </NavLink>

            <NavLink href="/admin/genres">
              <Music size={20} />
              <span>Genres</span>
            </NavLink>

            <NavLink href="/admin/records">
              <Disc size={20} />
              <span>Records</span>
            </NavLink>
          </nav>

          <div class="p-4 border-t border-gray-100">
            <A
              href="/"
              class="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-black transition-colors"
            >
              <LogOut size={20} />
              <span>Exit to Shop</span>
            </A>
          </div>
        </aside>

        {/* Main Content */}
        <main class="flex-1 ml-64 min-h-screen overflow-y-auto">
          <div class="max-w-7xl mx-auto p-8">{props.children}</div>
        </main>
      </div>
    </Show>
  );
}

function NavLink(props) {
  return (
    <A
      href={props.href}
      end={props.end}
      class="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors"
      activeClass="bg-black text-white shadow-sm"
      inactiveClass="text-gray-600 hover:bg-gray-100 hover:text-black"
    >
      {props.children}
    </A>
  );
}