import { createSignal, For, Show } from "solid-js";
import { Edit2, Trash2, Plus, X, Save, Loader2, Image as ImageIcon } from "lucide-solid";
import api from "../../lib/api";

export default function RecordManager(props) {
  const [editingId, setEditingId] = createSignal(null);
  const [isFormOpen, setIsFormOpen] = createSignal(false);
  const [loading, setLoading] = createSignal(false);
  
  const [form, setForm] = createSignal({
    name: "",
    shortDescription: "",
    description: "",
    price: 0,
    stock: 0,
    images: [""],
    mainArtistId: "",
    coArtistIds: [],
    genreIds: []
  });

  const openEdit = (record) => {
    setEditingId(record.id);
    setForm({
      name: record.name,
      shortDescription: record.shortDescription || "",
      description: record.description,
      price: record.price,
      stock: record.stock,
      images: record.images && record.images.length > 0 ? record.images : [""],
      mainArtistId: record.mainArtist?.id || "",
      coArtistIds: record.coArtists?.map(a => a.id) || [],
      genreIds: record.genres?.map(g => g.id) || []
    });
    setIsFormOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({
      name: "",
      shortDescription: "",
      description: "",
      price: 0,
      stock: 0,
      images: [""],
      mainArtistId: "",
      coArtistIds: [],
      genreIds: []
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const toggleGenre = (genreId) => {
    const currentIds = form().genreIds;
    if (currentIds.includes(genreId)) {
      setForm({ ...form(), genreIds: currentIds.filter(id => id !== genreId) });
    } else {
      setForm({ ...form(), genreIds: [...currentIds, genreId] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = {
      ...form(),
      price: Number(form().price),
      stock: Number(form().stock),
      mainArtistId: Number(form().mainArtistId),
      // Filter out empty image strings
      images: form().images.filter(img => img.trim() !== "")
    };

    try {
      if (editingId()) {
        await api.patch(`records/${editingId()}`, { json: data });
      } else {
        await api.post("records", { json: data });
      }
      closeForm();
      props.refetch();
    } catch (err) {
      alert("Error saving record");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      await api.delete(`records/${id}`);
      props.refetch();
    } catch (err) {
      alert("Error deleting record");
    }
  };

  return (
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-semibold text-gray-800">Records</h2>
        <button
          onClick={openCreate}
          class="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
        >
          <Plus size={18} />
          Add Record
        </button>
      </div>

      <Show when={isFormOpen()}>
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 animate-in slide-in-from-top-4 duration-200">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium">{editingId() ? "Edit Record" : "New Record"}</h3>
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
                  placeholder="Record Name"
                />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700">Main Artist</label>
                <select
                  value={form().mainArtistId}
                  onChange={(e) => setForm({ ...form(), mainArtistId: e.target.value })}
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5 bg-white"
                >
                  <option value="">Select Artist</option>
                  <For each={props.artists}>
                    {artist => <option value={artist.id}>{artist.name}</option>}
                  </For>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700">Price</label>
                <div class="relative">
                  <span class="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form().price}
                    onInput={(e) => setForm({ ...form(), price: e.target.value })}
                    required
                    class="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5"
                  />
                </div>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700">Stock</label>
                <input
                  type="number"
                  min="0"
                  value={form().stock}
                  onInput={(e) => setForm({ ...form(), stock: e.target.value })}
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Short Description</label>
              <input
                value={form().shortDescription}
                onInput={(e) => setForm({ ...form(), shortDescription: e.target.value })}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5"
                placeholder="Brief summary..."
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={form().description}
                onInput={(e) => setForm({ ...form(), description: e.target.value })}
                required
                rows={4}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5"
                placeholder="Full details..."
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Genres</label>
              <div class="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-md bg-white max-h-32 overflow-y-auto">
                <For each={props.genres}>
                  {genre => (
                    <button
                      type="button"
                      onClick={() => toggleGenre(genre.id)}
                      class={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        form().genreIds.includes(genre.id)
                          ? "bg-black text-white border-black"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {genre.name}
                    </button>
                  )}
                </For>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Image URL</label>
              <div class="flex gap-2">
                <input
                  value={form().images[0]}
                  onInput={(e) => {
                    const newImages = [...form().images];
                    newImages[0] = e.target.value;
                    setForm({ ...form(), images: newImages });
                  }}
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5"
                  placeholder="https://..."
                />
                <Show when={form().images[0]}>
                  <div class="w-10 h-10 border rounded bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                    <img src={form().images[0]} alt="Preview" class="w-full h-full object-cover" />
                  </div>
                </Show>
              </div>
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
                {editingId() ? "Update Record" : "Create Record"}
              </button>
            </div>
          </form>
        </div>
      </Show>

      <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table class="w-full text-left text-sm">
          <thead class="bg-gray-50 text-gray-600 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 font-medium">Record</th>
              <th class="px-6 py-3 font-medium">Artist</th>
              <th class="px-6 py-3 font-medium">Price</th>
              <th class="px-6 py-3 font-medium">Stock</th>
              <th class="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <For each={props.records?.items}>
              {record => (
                <tr class="hover:bg-gray-50/50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-gray-100 rounded flex items-center justify-center shrink-0 overflow-hidden">
                        <Show when={record.images?.[0]} fallback={<ImageIcon size={16} class="text-gray-400" />}>
                          <img src={record.images[0]} alt={record.name} class="w-full h-full object-cover" />
                        </Show>
                      </div>
                      <div>
                        <div class="font-medium text-gray-900">{record.name}</div>
                        <div class="text-xs text-gray-500 max-w-[150px] truncate">{record.shortDescription}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 font-medium text-gray-700">{record.mainArtist?.name || "-"}</td>
                  <td class="px-6 py-4 font-medium text-gray-900">${record.price}</td>
                  <td class="px-6 py-4">
                    <span class={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      record.stock > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    }`}>
                      {record.stock} in stock
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(record)}
                        class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
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
            <Show when={!props.records?.items?.length}>
              <tr>
                <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                  No records found. Add one to get started.
                </td>
              </tr>
            </Show>
          </tbody>
        </table>
      </div>
    </div>
  );
}
