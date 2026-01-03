import { createSignal, createResource, For, Show } from "solid-js";
import { api } from "../lib/api";
import { fetchProducts, fetchArtists, fetchGenres } from "../features/products/products.api";
import { cn } from "../lib/utils";

const fetchCategories = async () => (await api.get('categories').json());

export default function Admin() {
  const [activeTab, setActiveTab] = createSignal("products");
  const [categories, { refetch }] = createResource(fetchCategories);

  return (
    <div class="w-full">
      <div class="flex items-center justify-between mb-8 border-4 border-black p-4 bg-[var(--retro-red)] text-white">
        <h1 class="font-black uppercase">DASHBOARD (SECRET STUFF)</h1>
        <div class="flex gap-2">
           <TabButton 
             active={activeTab() === "products"} 
             onClick={() => setActiveTab("products")}
             label="THINGS"
           />
           <TabButton 
             active={activeTab() === "categories"} 
             onClick={() => setActiveTab("categories")}
             label="GROUPS"
           />
        </div>
      </div>

      <div class="min-h-[500px]">
        <Show when={activeTab() === "products"}>
           <ProductAdmin categories={categories() || []} />
        </Show>
        <Show when={activeTab() === "categories"}>
           <CategoryAdmin categories={categories() || []} onUpdate={refetch} />
        </Show>
      </div>
    </div>
  );
}

function TabButton(props) {
  return (
    <button 
      onClick={props.onClick}
      class={cn(
        "font-bold uppercase px-4 py-2 border-2 border-black",
        props.active 
          ? "bg-white text-black" 
          : "bg-black text-white hover:bg-gray-800"
      )}
    >
      {props.label}
    </button>
  );
}

// --- Sub-Components ---

function ProductAdmin(props) {
  const [view, setView] = createSignal("list"); // 'list' | 'create' | 'edit'
  const [editingId, setEditId] = createSignal(null);
  
  const [products, { refetch }] = createResource(async () => {
    const res = await fetchProducts(1, 100);
    return res.items;
  });

  const [artists] = createResource(fetchArtists);
  const [genres] = createResource(fetchGenres);

  const [formData, setFormData] = createSignal({
    name: "",
    shortDescription: "",
    description: "",
    price: 0,
    stock: 0,
    categoryId: "",
    images: "",
    artistIds: [],
    genreIds: []
  });

  const handleCreate = () => {
    setFormData({
      name: "", 
      shortDescription: "", 
      description: "", 
      price: 0, 
      stock: 0, 
      categoryId: "", 
      images: "",
      artistIds: [],
      genreIds: []
    });
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
    if (!confirm("Delete product?")) return;
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
      
      alert(view() === "edit" ? 'FIXED!' : 'BORN!');
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
    <div>
      <div class="flex justify-between items-center mb-4">
        <h2 class="font-bold uppercase bg-[var(--retro-yellow)] px-2 border-2 border-black">
          {view() === 'list' ? 'STUFF IN BOXES' : view() === 'edit' ? 'FIXING STUFF' : 'MAKING STUFF'}
        </h2>
        <Show when={view() === 'list'}>
          <button onClick={handleCreate} class="bg-[var(--retro-green)] px-4 py-2 font-bold uppercase border-2 border-black">
             + ADD NEW
          </button>
        </Show>
        <Show when={view() !== 'list'}>
          <button onClick={() => setView('list')} class="bg-[var(--retro-red)] text-white px-4 py-2 font-bold uppercase border-2 border-black">
             NEVERMIND
          </button>
        </Show>
      </div>

      <Show when={view() === 'list'}>
        <div class="border-4 border-black bg-white">
          <table class="w-full text-left">
            <thead class="bg-black text-white uppercase font-bold">
              <tr>
                <th class="p-2 border-r-2 border-black">NAME</th>
                <th class="p-2 border-r-2 border-black text-center">$$</th>
                <th class="p-2 border-r-2 border-black text-center">HOW MANY?</th>
                <th class="p-2 text-right">DO STUFF</th>
              </tr>
            </thead>
            <tbody>
              <For each={products()}>
                {(p) => (
                  <tr class="border-b-2 border-black font-bold">
                    <td class="p-2 uppercase border-r-2 border-black">{p.name}</td>
                    <td class="p-2 text-center border-r-2 border-black">${p.price}</td>
                    <td class="p-2 text-center border-r-2 border-black">
                      <span class={cn("px-2 py-1 border border-black", p.stock === 0 ? "bg-[var(--retro-red)] text-white" : "bg-[var(--retro-yellow)]")}>
                        {p.stock}
                      </span>
                    </td>
                    <td class="p-2 text-right space-x-2">
                      <button onClick={() => handleEdit(p)} class="bg-[var(--retro-blue)] text-white px-2 border border-black">FIX</button>
                      <button onClick={() => handleDelete(p.id)} class="bg-[var(--retro-red)] text-white px-2 border border-black">BIN</button>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </Show>

      <Show when={view() !== 'list'}>
        <form onSubmit={handleSubmit} class="border-4 border-black p-4 bg-white space-y-4">
             <div class="grid grid-cols-2 gap-4">
               <div class="flex flex-col">
                 <label class="font-bold uppercase">NAME</label>
                 <input required class="border-2 border-black p-2 bg-[#f9f9f9]"
                   value={formData().name} onInput={(e) => setFormData({...formData(), name: e.target.value})} />
               </div>
               <div class="flex flex-col">
                 <label class="font-bold uppercase">PRICE</label>
                 <input type="number" step="0.01" required class="border-2 border-black p-2 bg-[#f9f9f9]"
                   value={formData().price} onInput={(e) => setFormData({...formData(), price: e.currentTarget.value})} />
               </div>
             </div>

             <div class="grid grid-cols-2 gap-4">
               <div class="flex flex-col">
                 <label class="font-bold uppercase">HOW MANY?</label>
                 <input type="number" step="1" required class="border-2 border-black p-2 bg-[#f9f9f9]"
                   value={formData().stock} onInput={(e) => setFormData({...formData(), stock: e.currentTarget.value})} />
               </div>
               <div class="flex flex-col">
                 <label class="font-bold uppercase">Product Type</label>
                 <select required class="border-2 border-black p-2 bg-[#f9f9f9]"
                   value={formData().categoryId} onChange={(e) => setFormData({...formData(), categoryId: e.target.value }) }>
                   <option value="">Choose Type...</option>
                   <For each={props.categories}>{(cat) => <option value={cat.id}>{cat.name}</option>}</For>
                 </select>
               </div>
             </div>
             
             <div class="flex flex-col">
               <label class="font-bold uppercase">SHORT STORY</label>
               <input class="border-2 border-black p-2 bg-[#f9f9f9]"
                 value={formData().shortDescription} onInput={(e) => setFormData({...formData(), shortDescription: e.target.value})} />
             </div>

             <div class="flex flex-col">
               <label class="font-bold uppercase">BIG STORY</label>
               <textarea class="border-2 border-black p-2 bg-[#f9f9f9] h-24"
                 value={formData().description} onInput={(e) => setFormData({...formData(), description: e.target.value})} />
             </div>

             <div class="flex flex-col">
               <label class="font-bold uppercase">PICTURES (URL PER LINE)</label>
               <textarea class="border-2 border-black p-2 bg-[#f9f9f9] h-24"
                 value={formData().images} onInput={(e) => setFormData({...formData(), images: e.target.value})} />
             </div>

             <div class="grid grid-cols-2 gap-8 pt-4 border-t-2 border-black">
                <div class="flex flex-col">
                   <label class="font-bold uppercase mb-2">Artists</label>
                   <div class="border-2 border-black p-2 max-h-48 overflow-y-auto bg-[#f9f9f9]">
                      <For each={artists()}>
                        {(artist) => (
                           <label class="flex items-center gap-2 p-1 hover:bg-gray-200 cursor-pointer">
                              <input type="checkbox" 
                                checked={formData().artistIds.includes(artist.id)}
                                onChange={() => toggleSelection(artist.id, 'artistIds')}
                              />
                              <span class="uppercase font-bold text-sm">{artist.name}</span>
                           </label>
                        )}
                      </For>
                   </div>
                </div>

                <div class="flex flex-col">
                   <label class="font-bold uppercase mb-2">Genres</label>
                   <div class="border-2 border-black p-2 max-h-48 overflow-y-auto bg-[#f9f9f9]">
                      <For each={genres()}>
                        {(genre) => (
                           <label class="flex items-center gap-2 p-1 hover:bg-gray-200 cursor-pointer">
                              <input type="checkbox" 
                                checked={formData().genreIds.includes(genre.id)}
                                onChange={() => toggleSelection(genre.id, 'genreIds')}
                              />
                              <span class="uppercase font-bold text-sm">{genre.name}</span>
                           </label>
                        )}
                      </For>
                   </div>
                </div>
             </div>
             
             <button type="submit" class="w-full bg-[var(--retro-green)] font-bold py-4 uppercase border-4 border-black hover:bg-black hover:text-white mt-4">
               {view() === 'edit' ? 'FIX IT NOW' : 'MAKE IT REAL'}
             </button>
        </form>
      </Show>
    </div>
  );
}

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
    if (!confirm("Delete category? Everything inside will die!")) return;
    try {
      await api.delete(`categories/${id}`);
      props.onUpdate();
    } catch (err) { alert(err.message); }
  };

  const handleUpdateCategory = async (id, currentName) => {
    const name = prompt("New name?", currentName);
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
    return chain.join(" > ");
  };

  return (
    <div>
      <div class="flex justify-between items-end mb-8 bg-white border-4 border-black p-4">
        <h2 class="font-bold uppercase">MAKING GROUPS</h2>
        <form onSubmit={handleCreateCategory} class="flex gap-4 items-end">
          <div class="flex flex-col">
            <label class="font-bold uppercase">PARENT</label>
            <select class="border-2 border-black p-2 bg-[#f9f9f9]"
              value={parentId()} onChange={(e) => setParentId(e.target.value)}>
              <option value="">ROOT</option>
              <For each={props.categories}>{(cat) => <option value={cat.id}>{cat.name}</option>}</For>
            </select>
          </div>
          <div class="flex flex-col">
            <label class="font-bold uppercase">NAME</label>
            <input value={newCatName()} onInput={(e) => setNewCatName(e.target.value)} placeholder="NAME"
              class="border-2 border-black p-2 bg-[#f9f9f9]" />
          </div>
          <button type="submit" class="bg-[var(--retro-green)] px-4 py-2 border-2 border-black font-bold uppercase">CREATE</button>
        </form>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <For each={props.categories}>
          {(cat) => (
            <div class="p-4 border-4 border-black bg-white">
               <div class="flex justify-between items-start border-b-2 border-black pb-2">
                 <div class="flex flex-col">
                   <Show when={cat.parentId}>
                     <span class="bg-[var(--retro-yellow)] px-1 border border-black inline-block self-start mb-1 uppercase font-bold">{getBreadcrumbs(cat)}</span>
                   </Show>
                   <div class="flex items-center gap-2">
                     <h3 class="font-bold uppercase">{cat.name}</h3>
                     <button onClick={() => handleUpdateCategory(cat.id, cat.name)} class="bg-[var(--retro-blue)] text-white px-2 border border-black font-bold uppercase">FIX</button>
                   </div>
                 </div>
                 <button onClick={() => handleDeleteCategory(cat.id)} class="bg-[var(--retro-red)] text-white px-2 border border-black font-bold uppercase">BYE</button>
               </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}