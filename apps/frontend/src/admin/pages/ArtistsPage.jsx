import { createResource, createSignal } from "solid-js";
import { Edit2, Trash2, Save, Loader2, Image as ImageIcon } from "lucide-solid";
import api from "../../lib/api";
import { Table } from "../components/Table";
import { PageHeader } from "../components/PageHeader";
import { Modal } from "../components/Modal";

const fetchArtists = async () => {
  return await api.get("artists").json();
};

export default function ArtistsPage() {
  const [artists, { refetch }] = createResource(fetchArtists);
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [editingId, setEditingId] = createSignal(null);
  const [saving, setSaving] = createSignal(false);
  
  const [form, setForm] = createSignal({ 
    name: "", 
    slug: "", 
    bio: "", 
    image: "" 
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: "", slug: "", bio: "", image: "" });
    setIsModalOpen(true);
  };

  const openEdit = (artist) => {
    setEditingId(artist.id);
    setForm({ 
      name: artist.name, 
      slug: artist.slug, 
      bio: artist.bio || "",
      image: artist.image || ""
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId()) {
        await api.patch(`artists/${editingId()}`, { json: form() });
      } else {
        await api.post("artists", { json: form() });
      }
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      alert("Error saving artist");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this artist?")) return;
    try {
      await api.delete(`artists/${id}`);
      refetch();
    } catch (err) {
      alert("Error deleting artist");
    }
  };

  const columns = [
    {
      header: "Artist",
      accessor: "name",
      cell: (artist) => (
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-gray-200">
            {artist.image ? (
              <img src={artist.image} alt={artist.name} class="w-full h-full object-cover" />
            ) : (
              <ImageIcon size={16} class="text-gray-400" />
            )}
          </div>
          <div>
            <div class="font-medium text-gray-900">{artist.name}</div>
            <div class="text-xs text-gray-500 truncate max-w-[200px]">{artist.bio || "No bio"}</div>
          </div>
        </div>
      )
    },
    {
      header: "Slug",
      accessor: "slug",
      class: "text-gray-500 font-mono text-xs"
    },
    {
      header: "",
      accessor: "actions",
      class: "text-right",
      cell: (artist) => (
        <div class="flex justify-end gap-2">
          <button
            onClick={() => openEdit(artist)}
            class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleDelete(artist.id)}
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
        title="Artists" 
        description="Manage the artists in your store catalog."
        action={{ label: "Add Artist", onClick: openCreate }}
      />

      <Table 
        columns={columns} 
        data={artists()} 
        loading={artists.loading} 
        emptyText="No artists found. Start by adding one."
      />

      <Modal 
        isOpen={isModalOpen()} 
        onClose={() => setIsModalOpen(false)}
        title={editingId() ? "Edit Artist" : "New Artist"}
      >
        <form onSubmit={handleSubmit} class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Name</label>
              <input
                value={form().name}
                onInput={(e) => setForm({ ...form(), name: e.target.value })}
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5 transition-shadow"
                placeholder="Artist Name"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Slug</label>
              <input
                value={form().slug}
                onInput={(e) => setForm({ ...form(), slug: e.target.value })}
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5 transition-shadow"
                placeholder="artist-slug"
              />
            </div>
          </div>
          
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Image URL</label>
            <div class="flex gap-3">
              <input
                value={form().image}
                onInput={(e) => setForm({ ...form(), image: e.target.value })}
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5 transition-shadow"
                placeholder="https://..."
              />
              <div class="w-10 h-10 border border-gray-200 rounded-md bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                {form().image ? (
                  <img src={form().image} alt="Preview" class="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={16} class="text-gray-300" />
                )}
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Biography</label>
            <textarea
              value={form().bio}
              onInput={(e) => setForm({ ...form(), bio: e.target.value })}
              rows={4}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5 transition-shadow resize-none"
              placeholder="Tell us about the artist..."
            />
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
                  Save Artist
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
