import { createResource, createSignal, For, Show } from "solid-js";
import { Edit2, Trash2, Save, Loader2, Image as ImageIcon } from "lucide-solid";
import api from "../../lib/api";
import { Table } from "../components/Table";
import { PageHeader } from "../components/PageHeader";
import { Modal } from "../components/Modal";

const fetchRecords = async () => {
  return await api.get("records").json();
};

const fetchDependencies = async () => {
  const [artists, genres] = await Promise.all([
    api.get("artists").json(),
    api.get("genres").json()
  ]);
  return { artists, genres };
};

export default function RecordsPage() {
  const [records, { refetch }] = createResource(fetchRecords);
  const [dependencies] = createResource(fetchDependencies);
  
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [editingId, setEditingId] = createSignal(null);
  const [saving, setSaving] = createSignal(false);
  
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
    setIsModalOpen(true);
  };

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
    setIsModalOpen(true);
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
    setSaving(true);
    
    const data = {
      ...form(),
      price: Number(form().price),
      stock: Number(form().stock),
      mainArtistId: Number(form().mainArtistId),
      images: form().images.filter(img => img.trim() !== "")
    };

    try {
      if (editingId()) {
        await api.patch(`records/${editingId()}`, { json: data });
      } else {
        await api.post("records", { json: data });
      }
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      alert("Error saving record");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      await api.delete(`records/${id}`);
      refetch();
    } catch (err) {
      alert("Error deleting record");
    }
  };

  const columns = [
    {
      header: "Record",
      accessor: "name",
      cell: (record) => (
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gray-100 rounded overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center">
            {record.images?.[0] ? (
              <img src={record.images[0]} alt={record.name} class="w-full h-full object-cover" />
            ) : (
              <ImageIcon size={16} class="text-gray-400" />
            )}
          </div>
          <div>
            <div class="font-medium text-gray-900">{record.name}</div>
            <div class="text-xs text-gray-500 max-w-[150px] truncate">{record.shortDescription}</div>
          </div>
        </div>
      )
    },
    {
      header: "Artist",
      accessor: "mainArtist",
      cell: (record) => record.mainArtist?.name || <span class="text-gray-400">-</span>
    },
    {
      header: "Price",
      accessor: "price",
      cell: (record) => <span class="font-medium">${record.price}</span>
    },
    {
      header: "Stock",
      accessor: "stock",
      cell: (record) => (
        <span class={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          record.stock > 0 
            ? "bg-green-50 text-green-700 border border-green-200" 
            : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {record.stock} in stock
        </span>
      )
    },
    {
      header: "",
      accessor: "actions",
      class: "text-right",
      cell: (record) => (
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
      )
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Records" 
        description="Manage your inventory of vinyl records."
        action={{ label: "Add Record", onClick: openCreate }}
      />

      <Table 
        columns={columns} 
        data={records()?.items} 
        loading={records.loading} 
        emptyText="No records in inventory. Add your first vinyl."
      />

      <Modal 
        isOpen={isModalOpen()} 
        onClose={() => setIsModalOpen(false)}
        title={editingId() ? "Edit Record" : "New Record"}
      >
        <Show when={!dependencies.loading} fallback={
          <div class="flex items-center justify-center p-8 text-gray-500">
            <Loader2 size={24} class="animate-spin mr-2" />
            Loading options...
          </div>
        }>
          <form onSubmit={handleSubmit} class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700">Record Name</label>
                <input
                  value={form().name}
                  onInput={(e) => setForm({ ...form(), name: e.target.value })}
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5 transition-shadow"
                  placeholder="Album Title"
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
                  <For each={dependencies()?.artists}>
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
                    class="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5 transition-shadow"
                  />
                </div>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700">Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={form().stock}
                  onInput={(e) => setForm({ ...form(), stock: e.target.value })}
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5 transition-shadow"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Short Description</label>
              <input
                value={form().shortDescription}
                onInput={(e) => setForm({ ...form(), shortDescription: e.target.value })}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5 transition-shadow"
                placeholder="Brief summary for listings..."
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Full Description</label>
              <textarea
                value={form().description}
                onInput={(e) => setForm({ ...form(), description: e.target.value })}
                required
                rows={4}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5 transition-shadow resize-none"
                placeholder="Detailed information about the record..."
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Genres</label>
              <div class="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-md bg-gray-50/50 max-h-32 overflow-y-auto">
                <For each={dependencies()?.genres}>
                  {genre => (
                    <button
                      type="button"
                      onClick={() => toggleGenre(genre.id)}
                      class={`px-3 py-1 text-xs rounded-full border transition-all ${
                        form().genreIds.includes(genre.id)
                          ? "bg-black text-white border-black shadow-sm"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {genre.name}
                    </button>
                  )}
                </For>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Cover Image URL</label>
              <div class="flex gap-3">
                <input
                  value={form().images[0]}
                  onInput={(e) => {
                    const newImages = [...form().images];
                    newImages[0] = e.target.value;
                    setForm({ ...form(), images: newImages });
                  }}
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5 transition-shadow"
                  placeholder="https://..."
                />
                <div class="w-10 h-10 border border-gray-200 rounded-md bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                  <Show when={form().images[0]} fallback={<ImageIcon size={16} class="text-gray-300" />}>
                    <img src={form().images[0]} alt="Preview" class="w-full h-full object-cover" />
                  </Show>
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving()}
                class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving() ? (
                  <>
                    <Loader2 size={16} class="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Record
                  </>
                )}
              </button>
            </div>
          </form>
        </Show>
      </Modal>
    </div>
  );
}
