import { createResource, Show, For } from "solid-js";
import { A } from "@solidjs/router";
import { Users, Music, Disc, ArrowRight, DollarSign } from "lucide-solid";
import api from "../../lib/api";

const fetchStats = async () => {
  return await api.get("purchases/stats").json();
};

export default function DashboardPage() {
  const [stats] = createResource(fetchStats);

  const maxRevenue = () => {
    if (!stats()?.revenueByDay?.length) return 0;
    return Math.max(...stats().revenueByDay.map(d => d.sum));
  };

  return (
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p class="text-gray-500 mt-2">Welcome back. Here's an overview of your store's content.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard 
          title="Artists" 
          description="Manage artist profiles and bios."
          icon={Users}
          href="/admin/artists"
          color="bg-blue-50 text-blue-600"
        />
        <DashboardCard 
          title="Genres" 
          description="Organize music categories."
          icon={Music}
          href="/admin/genres"
          color="bg-purple-50 text-purple-600"
        />
        <DashboardCard 
          title="Records" 
          description="Update inventory and pricing."
          icon={Disc}
          href="/admin/records"
          color="bg-emerald-50 text-emerald-600"
        />
      </div>

      <Show when={stats()}>
        <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">Revenue Overview</h2>
              <p class="text-sm text-gray-500">Last 30 days performance</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500">Total Revenue</p>
              <p class="text-2xl font-bold text-gray-900">${stats().totalRevenue.toFixed(2)}</p>
            </div>
          </div>

          <div class="h-64 flex items-end gap-1 pt-4 border-t border-gray-100">
            <Show when={stats().revenueByDay.length > 0} fallback={<div class="w-full text-center text-gray-400 self-center">No revenue data yet.</div>}>
              <For each={stats().revenueByDay}>
                {(day) => (
                  <div class="flex-1 flex flex-col justify-end group relative">
                    <div 
                      class="bg-black group-hover:bg-gray-700 transition-all rounded-t-sm w-full"
                      style={{ height: `${maxRevenue() ? (day.sum / maxRevenue()) * 100 : 0}%`, minHeight: '4px' }}
                    ></div>
                    {/* Tooltip */}
                    <div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      <div class="font-bold">${day.sum.toFixed(2)}</div>
                      <div class="text-[10px] text-gray-300">{new Date(day.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}
              </For>
            </Show>
          </div>
          <div class="flex justify-between text-xs text-gray-400 mt-2">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </div>
      </Show>
    </div>
  );
}

function DashboardCard(props) {
  return (
    <A href={props.href} class="block no-underline group">
      <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow h-full">
        <div class={`w-12 h-12 ${props.color} rounded-lg flex items-center justify-center mb-4`}>
          <props.icon size={24} />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{props.title}</h3>
        <p class="text-gray-500 text-sm mb-4">{props.description}</p>
        <div class="inline-flex items-center text-sm font-medium text-black group-hover:text-blue-600">
          Manage {props.title} <ArrowRight size={16} class="ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </A>
  );
}