import { createSignal, For, Show } from "solid-js";
import { Edit2, Trash2, Plus, X, Save, Loader2 } from "lucide-solid";
import api from "../../lib/api";

export default function GenreManager(props) {
  const [editingId, setEditingId] = createSignal(null);
  const [isFormOpen, setIsFormOpen] = createSignal(false);
  const [loading, setLoading] = createSignal(false);
  const [form, setForm] = createSignal({ name: "", slug: "", description: "" });

  const openEdit = (genre) => {
    setEditingId(genre.id);
    setForm({ 
      name: genre.name, 
      slug: genre.slug, 
      description: genre.description || "" 
    });
    setIsFormOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: "", slug: "", description: "" });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId()) {
        await api.patch(`genres/${editingId()}`, { json: form() });
      } else {
        await api.post("genres", { json: form() });
      }
      closeForm();
      props.refetch();
    } catch (err) {
      alert("Error saving genre");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this genre?")) return;
    try {
      await api.delete(`genres/${id}`);
      props.refetch();
    } catch (err) {
      alert("Error deleting genre");
    }
  };

  return (
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-semibold text-gray-800">Genres</h2>
        <button
          onClick={openCreate}
          class="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
        >
          <Plus size={18} />
          Add Genre
        </button>
      </div>

      <Show when={isFormOpen()}>
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 animate-in slide-in-from-top-4 duration-200">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium">{editingId() ? "Edit Genre" : "New Genre"}</h3>
            <button onClick={closeForm} class="text-gray-500 hover:text-black">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700">Name</label>
                <input
                  value={form().name}
                  onInput={(e) => setForm({ ...form(), name: e.target.value })}
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5"
                  placeholder="e.g. Rock"
                />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700">Slug</label>
                <input
                  value={form().slug}
                  onInput={(e) => setForm({ ...form(), slug: e.target.value })}
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5"
                  placeholder="e.g. rock"
                />
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={form().description}
                onInput={(e) => setForm({ ...form(), description: e.target.value })}
                rows={3}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5"
                placeholder="Optional description..."
              />
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeForm}
                class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading()}
                class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <Show when={loading()} fallback={<Save size={16} />}>
                  <Loader2 size={16} class="animate-spin" />
                </Show>
                {editingId() ? "Update Genre" : "Create Genre"}
              </button>
            </div>
          </form>
        </div>
      </Show>

      <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table class="w-full text-left text-sm">
          <thead class="bg-gray-50 text-gray-600 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 font-medium">Name</th>
              <th class="px-6 py-3 font-medium">Slug</th>
              <th class="px-6 py-3 font-medium">Description</th>
              <th class="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <For each={props.genres}>
              {(genre) => (
                <tr class="hover:bg-gray-50/50 transition-colors">
                  <td class="px-6 py-4 font-medium text-gray-900">{genre.name}</td>
                  <td class="px-6 py-4 text-gray-500">{genre.slug}</td>
                  <td class="px-6 py-4 text-gray-500 max-w-xs truncate">{genre.description || "-"}</td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(genre)}
                        class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(genre.id)}
                        class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </For>
            <Show when={props.genres?.length === 0}>
              <tr>
                <td colspan="4" class="px-6 py-8 text-center text-gray-500">
                  No genres found. Add one to get started.
                </td>
              </tr>
            </Show>
          </tbody>
        </table>
      </div>
    </div>
  );
}
