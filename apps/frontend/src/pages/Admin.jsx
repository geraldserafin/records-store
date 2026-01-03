import { createSignal, createResource, For, Show } from "solid-js";
import { api } from "../lib/api";
import { fetchProducts, fetchArtists, fetchGenres } from "../features/products/products.api";
import { 
  Package, 
  Layers, 
  Plus, 
  Trash2, 
  Edit2, 
  Search, 
  Check, 
  X,
  LayoutDashboard
} from "lucide-solid";
import { cn } from "../lib/utils";

const fetchCategories = async () => (await api.get('categories').json());

export default function Admin() {
  const [activeView, setActiveView] = createSignal("products");
  const [categories, { refetch }] = createResource(fetchCategories);

  return (
    <div class="admin-theme flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside class="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div class="p-6 border-b border-slate-100">
          <h1 class="font-bold text-xl tracking-tight text-slate-900 flex items-center gap-2">
            <LayoutDashboard class="w-6 h-6 text-indigo-600" />
            Admin
          </h1>
        </div>
        
        <nav class="flex-1 p-4 space-y-1">
          <SidebarButton 
            active={activeView() === "products"} 
            onClick={() => setActiveView("products")}
            icon={Package}
            label="Products"
          />
          <SidebarButton 
            active={activeView() === "categories"} 
            onClick={() => setActiveView("categories")}
            icon={Layers}
            label="Categories"
          />
        </nav>

        <div class="p-4 border-t border-slate-100">
          <a href="/" class="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
            ← Back to Shop
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main class="flex-1 overflow-auto">
        <header class="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10">
          <h2 class="text-2xl font-semibold text-slate-800 capitalize">
            {activeView()} Management
          </h2>
        </header>

        <div class="p-8 max-w-7xl mx-auto">
          <Show when={activeView() === "products"}>
             <ProductAdmin categories={categories() || []} />
          </Show>
          <Show when={activeView() === "categories"}>
             <CategoryAdmin categories={categories() || []} onUpdate={refetch} />
          </Show>
        </div>
      </main>
    </div>
  );
}

function SidebarButton(props) {
  return (
    <button 
      onClick={props.onClick}
      class={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
        props.active 
          ? "bg-indigo-50 text-indigo-700" 
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      <props.icon class={cn("w-5 h-5", props.active ? "text-indigo-600" : "text-slate-400")} />
      {props.label}
    </button>
  );
}

// --- Product Admin ---

function ProductAdmin(props) {
  const [view, setView] = createSignal("list"); // 'list' | 'create' | 'edit'
  const [editingId, setEditId] = createSignal(null);
  const [searchTerm, setSearchTerm] = createSignal("");
  
  const [products, { refetch }] = createResource(async () => {
    const res = await fetchProducts(1, 100);
    return res.items;
  });

  const filteredProducts = () => {
    const term = searchTerm().toLowerCase();
    return products()?.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.category?.name?.toLowerCase().includes(term)
    ) || [];
  };

  const [artists] = createResource(fetchArtists);
  const [genres] = createResource(fetchGenres);

  const [formData, setFormData] = createSignal(initialFormState());

  function initialFormState() {
    return {
      name: "",
      shortDescription: "",
      description: "",
      price: 0,
      stock: 0,
      categoryId: "",
      images: "",
      artistIds: [],
      genreIds: []
    };
  }

  const handleCreate = () => {
    setFormData(initialFormState());
    setEditId(null);
    setView("create");
  };

  const handleEdit = (p) => {
    setEditId(p.id);
    setFormData({
      name: p.name,
      shortDescription: p.shortDescription || "",
      description: p.description,
      price: p.price,
      stock: p.stock,
      categoryId: p.category?.id || "",
      images: p.images ? p.images.join('\n') : "",
      artistIds: p.artists ? p.artists.map(a => a.id) : [],
      genreIds: p.genres ? p.genres.map(g => g.id) : []
    });
    setView("edit");
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`products/${id}`);
      refetch();
    } catch (err) { alert(err.message); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const imagesArray = formData().images.split('\n').map(s => s.trim()).filter(Boolean);
      const payload = {
        ...formData(),
        price: Number(formData().price),
        stock: Number(formData().stock),
        categoryId: Number(formData().categoryId),
        images: imagesArray,
        artistIds: formData().artistIds.map(Number),
        genreIds: formData().genreIds.map(Number)
      };

      if (view() === "edit") {
        await api.patch(`products/${editingId()}`, { json: payload });
      } else {
        await api.post('products', { json: payload });
      }
      
      setView("list");
      refetch();
    } catch (err) { alert(err.message); }
  };

  const toggleSelection = (id, field) => {
    const current = formData()[field];
    const numId = Number(id);
    const newSelection = current.includes(numId)
      ? current.filter(i => i !== numId)
      : [...current, numId];
    setFormData({ ...formData(), [field]: newSelection });
  };

  return (
    <div class="space-y-6">
      <Show when={view() === 'list'}>
        <div class="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div class="relative w-96">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search products..." 
              class="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={searchTerm()}
              onInput={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={handleCreate} 
            class="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
             <Plus class="w-4 h-4" /> New Product
          </button>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th class="px-6 py-4">Product Name</th>
                <th class="px-6 py-4">Price</th>
                <th class="px-6 py-4">Stock</th>
                <th class="px-6 py-4">Category</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <For each={filteredProducts()}>
                {(p) => (
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-6 py-4 font-medium text-slate-900">{p.name}</td>
                    <td class="px-6 py-4 text-slate-600">${p.price}</td>
                    <td class="px-6 py-4">
                      <span class={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        p.stock === 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      )}>
                        {p.stock}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-slate-500">{p.category?.name}</td>
                    <td class="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleEdit(p)} class="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded">
                        <Edit2 class="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} class="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded">
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </Show>

      <Show when={view() !== 'list'}>
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-4xl mx-auto">
          <div class="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
            <h3 class="text-xl font-bold text-slate-800">
              {view() === 'edit' ? 'Edit Product' : 'Create New Product'}
            </h3>
            <button 
              onClick={() => setView('list')}
              class="text-slate-500 hover:text-slate-800 font-medium text-sm"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} class="space-y-8">
             <div class="grid grid-cols-2 gap-6">
               <FormInput label="Name" value={formData().name} onInput={(v) => setFormData({...formData(), name: v})} required />
               <FormInput label="Price ($)" type="number" step="0.01" value={formData().price} onInput={(v) => setFormData({...formData(), price: v})} required />
             </div>

             <div class="grid grid-cols-2 gap-6">
               <FormInput label="Stock" type="number" step="1" value={formData().stock} onInput={(v) => setFormData({...formData(), stock: v})} required />
               <div class="flex flex-col gap-2">
                 <label class="text-sm font-medium text-slate-700">Category</label>
                 <select 
                   required 
                   class="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                   value={formData().categoryId} 
                   onChange={(e) => setFormData({...formData(), categoryId: e.target.value }) }
                 >
                   <option value="">Select Category</option>
                   <For each={props.categories}>{(cat) => <option value={cat.id}>{cat.name}</option>}</For>
                 </select>
               </div>
             </div>
             
             <FormInput label="Short Description" value={formData().shortDescription} onInput={(v) => setFormData({...formData(), shortDescription: v})} />
             
             <div class="flex flex-col gap-2">
               <label class="text-sm font-medium text-slate-700">Description</label>
               <textarea 
                 class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow h-32 resize-none"
                 value={formData().description} 
                 onInput={(e) => setFormData({...formData(), description: e.target.value})} 
               />
             </div>

             <div class="flex flex-col gap-2">
               <label class="text-sm font-medium text-slate-700">Image URLs (one per line)</label>
               <textarea 
                 class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow h-32 resize-none font-mono text-xs"
                 value={formData().images} 
                 onInput={(e) => setFormData({...formData(), images: e.target.value})} 
               />
             </div>

             <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                <SelectionGroup 
                  title="Artists" 
                  items={artists()} 
                  selected={formData().artistIds} 
                  onChange={(id) => toggleSelection(id, 'artistIds')} 
                />
                <SelectionGroup 
                  title="Genres" 
                  items={genres()} 
                  selected={formData().genreIds} 
                  onChange={(id) => toggleSelection(id, 'genreIds')} 
                />
             </div>
             
             <div class="flex justify-end pt-6 border-t border-slate-100">
               <button 
                 type="submit" 
                 class="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
               >
                 {view() === 'edit' ? 'Save Changes' : 'Create Product'}
               </button>
             </div>
          </form>
        </div>
      </Show>
    </div>
  );
}

// --- Category Admin ---

function CategoryAdmin(props) {
  const [newCatName, setNewCatName] = createSignal("");
  const [parentId, setParentId] = createSignal("");

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName()) return;
    try {
      const payload = { name: newCatName() };
      if (parentId()) payload.parentId = Number(parentId());
      await api.post('categories', { json: payload });
      setNewCatName("");
      setParentId("");
      props.onUpdate();
    } catch (err) { alert(err.message); }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm("Delete category? This will affect all associated products.")) return;
    try {
      await api.delete(`categories/${id}`);
      props.onUpdate();
    } catch (err) { alert(err.message); }
  };

  const handleUpdateCategory = async (id, currentName) => {
    const name = prompt("Enter new category name:", currentName);
    if (!name || name === currentName) return;
    try {
      await api.patch(`categories/${id}`, { json: { name } });
      props.onUpdate();
    } catch (err) { alert(err.message); }
  };

  const getBreadcrumbs = (cat) => {
    const chain = [];
    let current = cat;
    while (current.parentId) {
      const parent = props.categories.find(p => p.id === current.parentId);
      if (!parent) break;
      chain.unshift(parent.name);
      current = parent;
    }
    return chain.join(" › ");
  };

  return (
    <div class="space-y-8">
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 class="text-lg font-bold text-slate-800 mb-4">Create New Category</h3>
        <form onSubmit={handleCreateCategory} class="flex gap-4 items-end">
          <div class="flex-1 space-y-2">
            <label class="text-sm font-medium text-slate-700">Parent Category</label>
            <select 
              class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={parentId()} 
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">None (Root)</option>
              <For each={props.categories}>{(cat) => <option value={cat.id}>{cat.name}</option>}</For>
            </select>
          </div>
          <div class="flex-1 space-y-2">
            <label class="text-sm font-medium text-slate-700">Category Name</label>
            <input 
              value={newCatName()} 
              onInput={(e) => setNewCatName(e.target.value)} 
              placeholder="e.g. Vinyl"
              class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button 
            type="submit" 
            class="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
          >
            Create
          </button>
        </form>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <For each={props.categories}>
          {(cat) => (
            <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
               <div class="flex justify-between items-start">
                 <div class="space-y-1">
                   <Show when={cat.parentId}>
                     <span class="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block">
                        {getBreadcrumbs(cat)}
                     </span>
                   </Show>
                   <h4 class="font-bold text-slate-800">{cat.name}</h4>
                 </div>
                 <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => handleUpdateCategory(cat.id, cat.name)} class="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded">
                     <Edit2 class="w-4 h-4" />
                   </button>
                   <button onClick={() => handleDeleteCategory(cat.id)} class="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-50 rounded">
                     <Trash2 class="w-4 h-4" />
                   </button>
                 </div>
               </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

// --- Helpers ---

function FormInput(props) {
  return (
    <div class="flex flex-col gap-2">
       <label class="text-sm font-medium text-slate-700">{props.label}</label>
       <input 
         type={props.type || "text"}
         step={props.step}
         required={props.required}
         class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
         value={props.value} 
         onInput={(e) => props.onInput(e.target.value)} 
       />
    </div>
  );
}

function SelectionGroup(props) {
  return (
    <div class="flex flex-col gap-3">
       <label class="text-sm font-bold text-slate-800 uppercase tracking-wider">{props.title}</label>
       <div class="border border-slate-200 rounded-lg max-h-48 overflow-y-auto bg-slate-50 p-2 space-y-1">
          <For each={props.items}>
            {(item) => (
               <label class="flex items-center gap-3 p-2 hover:bg-white hover:shadow-sm rounded-md cursor-pointer transition-all select-none">
                  <div class={cn(
                    "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                    props.selected.includes(item.id) 
                      ? "bg-indigo-600 border-indigo-600" 
                      : "bg-white border-slate-300"
                  )}>
                    <Show when={props.selected.includes(item.id)}>
                      <Check class="w-3.5 h-3.5 text-white" />
                    </Show>
                  </div>
                  <input 
                    type="checkbox" 
                    class="hidden"
                    checked={props.selected.includes(item.id)}
                    onChange={() => props.onChange(item.id)}
                  />
                  <span class="text-sm font-medium text-slate-700">{item.name}</span>
               </label>
            )}
          </For>
       </div>
    </div>
  );
}
