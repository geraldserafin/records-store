import { createResource, createSignal } from "solid-js";
import { Edit2, Trash2, Save, Loader2 } from "lucide-solid";
import api from "../../lib/api";
import { Table } from "../components/Table";
import { PageHeader } from "../components/PageHeader";
import { Modal } from "../components/Modal";

const fetchGenres = async () => {
  return await api.get("genres").json();
};

export default function GenresPage() {
  const [genres, { refetch }] = createResource(fetchGenres);
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [editingId, setEditingId] = createSignal(null);
  const [saving, setSaving] = createSignal(false);
  
  const [form, setForm] = createSignal({ 
    name: "", 
    slug: "", 
    description: "" 
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: "", slug: "", description: "" });
    setIsModalOpen(true);
  };

  const openEdit = (genre) => {
    setEditingId(genre.id);
    setForm({ 
      name: genre.name, 
      slug: genre.slug, 
      description: genre.description || ""
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId()) {
        await api.patch(`genres/${editingId()}`, { json: form() });
      } else {
        await api.post("genres", { json: form() });
      }
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      alert("Error saving genre");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this genre?")) return;
    try {
      await api.delete(`genres/${id}`);
      refetch();
    } catch (err) {
      alert("Error deleting genre");
    }
  };

  const columns = [
    {
      header: "Name",
      accessor: "name",
      class: "font-medium text-gray-900"
    },
    {
      header: "Slug",
      accessor: "slug",
      class: "text-gray-500 font-mono text-xs"
    },
    {
      header: "Description",
      accessor: "description",
      class: "text-gray-500 max-w-xs truncate",
      cell: (genre) => genre.description || <span class="text-gray-300 italic">No description</span>
    },
    {
      header: "",
      accessor: "actions",
      class: "text-right",
      cell: (genre) => (
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
      )
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Genres" 
        description="Categorize your music collection with genres."
        action={{ label: "Add Genre", onClick: openCreate }}
      />

      <Table 
        columns={columns} 
        data={genres()} 
        loading={genres.loading} 
        emptyText="No genres found. Add some to organize your records."
      />

      <Modal 
        isOpen={isModalOpen()} 
        onClose={() => setIsModalOpen(false)}
        title={editingId() ? "Edit Genre" : "New Genre"}
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
                placeholder="Rock"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Slug</label>
              <input
                value={form().slug}
                onInput={(e) => setForm({ ...form(), slug: e.target.value })}
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5 transition-shadow"
                placeholder="rock"
              />
            </div>
          </div>
          
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={form().description}
              onInput={(e) => setForm({ ...form(), description: e.target.value })}
              rows={3}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5 transition-shadow resize-none"
              placeholder="Optional description..."
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
                  Save Genre
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
