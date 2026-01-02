import { createSignal, createResource, For, Show } from "solid-js";
import { api } from "../lib/api";
import { fetchProducts, flattenAttributes } from "../features/products/products.api";
import { Plus, X, Trash2 } from "lucide-solid";
import { cn } from "../lib/utils";

const fetchCategories = async () => (await api.get('categories').json());

export default function Admin() {
  const [activeTab, setActiveTab] = createSignal("products");
  const [categories, { refetch }] = createResource(fetchCategories);

  return (
    <div class="max-w-6xl mx-auto py-12 px-6">
      <div class="flex items-center justify-between mb-12 border-b-2 border-black pb-6">
        <h1 class="text-4xl font-black uppercase tracking-tighter text-black font-mono leading-none">Dashboard</h1>
        <div class="flex gap-4">
           <TabButton 
             active={activeTab() === "products"} 
             onClick={() => setActiveTab("products")}
             label="Products"
           />
           <TabButton 
             active={activeTab() === "categories"} 
             onClick={() => setActiveTab("categories")}
             label="Categories"
           />
           <TabButton 
             active={activeTab() === "bulk"} 
             onClick={() => setActiveTab("bulk")}
             label="Bulk Edit"
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
        <Show when={activeTab() === "bulk"}>
           <BulkEditAdmin categories={categories() || []} />
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
        "text-xs font-bold uppercase tracking-widest px-4 py-2 transition-all font-mono",
        props.active 
          ? "bg-black text-white" 
          : "bg-transparent text-gray-400 hover:text-black hover:underline underline-offset-4"
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

  const [formData, setFormData] = createSignal({
    name: "",
    shortDescription: "",
    description: "",
    price: 0,
    stock: 0,
    categoryId: "",
    images: "",
    attributes: {}
  });

  const selectedCategory = () => props.categories.find(c => c.id === Number(formData().categoryId));

  const allAttributes = () => {
    const cat = selectedCategory();
    if (!cat) return [];
    
    const collect = (c, acc = []) => {
      const attributes = c.attributes || [];
      const newAcc = [...attributes, ...acc];
      if (c.parentId) {
        const parent = props.categories.find(p => p.id === c.parentId);
        if (parent) return collect(parent, newAcc);
      }
      return newAcc;
    };
    return collect(cat);
  };

  const handleCreate = () => {
    setFormData({ name: "", shortDescription: "", description: "", price: 0, stock: 0, categoryId: "", images: "", attributes: {} });
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
      attributes: flattenAttributes(p)
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
        images: imagesArray
      };

      if (view() === "edit") {
        await api.patch(`products/${editingId()}`, { json: payload });
      } else {
        await api.post('products', { json: payload });
      }
      
      alert(view() === "edit" ? 'Updated!' : 'Created!');
      setView("list");
      refetch();
    } catch (err) { alert(err.message); }
  };

  return (
    <div class="font-mono">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-xl font-bold uppercase tracking-widest text-black">
          {view() === 'list' ? 'Inventory' : view() === 'edit' ? 'Edit Unit' : 'New Entry'}
        </h2>
        <Show when={view() === 'list'}>
          <button onClick={handleCreate} class="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">
             Add Product
          </button>
        </Show>
        <Show when={view() !== 'list'}>
          <button onClick={() => setView('list')} class="text-xs font-bold uppercase tracking-widest text-black hover:underline">
             Back
          </button>
        </Show>
      </div>

      <Show when={view() === 'list'}>
        <div class="border border-black bg-white">
          <table class="w-full text-left text-xs font-mono">
            <thead class="bg-black text-white uppercase font-bold">
              <tr>
                <th class="p-4">Name</th>
                <th class="p-4 text-center">Price</th>
                <th class="p-4 text-center">Stock</th>
                <th class="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <For each={products()}>
                {(p) => (
                  <tr class="border-b border-gray-200 hover:bg-gray-50 transition-colors font-bold">
                    <td class="p-4 uppercase">{p.name}</td>
                    <td class="p-4 text-center">${p.price}</td>
                    <td class="p-4 text-center">
                      <span class={cn("px-2 py-0.5", p.stock === 0 ? "bg-red-500 text-white" : "bg-black text-white")}>
                        {p.stock}
                      </span>
                    </td>
                    <td class="p-4 text-right space-x-6">
                      <button onClick={() => handleEdit(p)} class="hover:underline uppercase text-black">Edit</button>
                      <button onClick={() => handleDelete(p.id)} class="text-red-500 hover:underline uppercase">Delete</button>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </Show>

      <Show when={view() !== 'list'}>
        <form onSubmit={handleSubmit} class="max-w-3xl border border-black p-10 bg-white">
          <div class="space-y-10">
             <div class="grid grid-cols-2 gap-10">
               <div class="flex flex-col gap-2">
                 <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product Name</label>
                 <input required class="w-full border-b border-black py-2 text-sm font-bold focus:outline-none placeholder:text-gray-300"
                   value={formData().name} onInput={(e) => setFormData({...formData(), name: e.target.value})} />
               </div>
               <div class="flex flex-col gap-2">
                 <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Retail Price</label>
                 <input type="number" step="0.01" required class="w-full border-b border-black py-2 text-sm font-bold focus:outline-none placeholder:text-gray-300"
                   value={formData().price} onInput={(e) => setFormData({...formData(), price: e.currentTarget.value})} />
               </div>
             </div>

             <div class="grid grid-cols-2 gap-10">
               <div class="flex flex-col gap-2">
                 <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inventory Count</label>
                 <input type="number" step="1" required class="w-full border-b border-black py-2 text-sm font-bold focus:outline-none placeholder:text-gray-300"
                   value={formData().stock} onInput={(e) => setFormData({...formData(), stock: e.currentTarget.value})} />
               </div>
               <div class="flex flex-col gap-2">
                 <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Classification</label>
                 <select required class="w-full border-b border-black py-2 text-sm font-bold focus:outline-none bg-white"
                   value={formData().categoryId} onChange={(e) => setFormData({...formData(), categoryId: e.target.value, attributes: {} }) }>
                   <option value="">SELECT CATEGORY...</option>
                   <For each={props.categories}>{(cat) => <option value={cat.id}>{cat.name}</option>}</For>
                 </select>
               </div>
             </div>
             
             <div class="flex flex-col gap-2">
               <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Short Summary</label>
               <input class="w-full border-b border-black py-2 text-sm font-bold focus:outline-none placeholder:text-gray-300"
                 value={formData().shortDescription} onInput={(e) => setFormData({...formData(), shortDescription: e.target.value})} />
             </div>

             <div class="flex flex-col gap-2">
               <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Long Description</label>
               <textarea class="w-full border border-gray-200 p-4 text-sm font-bold focus:border-black focus:outline-none transition-colors h-32 resize-none"
                 value={formData().description} onInput={(e) => setFormData({...formData(), description: e.target.value})} />
             </div>

             <div class="flex flex-col gap-2">
               <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Visual Assets (URL per line)</label>
               <textarea class="w-full border border-gray-200 p-4 text-sm font-bold focus:border-black focus:outline-none transition-colors h-32 resize-none"
                 value={formData().images} onInput={(e) => setFormData({...formData(), images: e.target.value})} />
             </div>

             <Show when={selectedCategory()}>
               <div class="pt-10 border-t border-black">
                 <span class="text-white bg-black uppercase text-[10px] font-bold px-2 py-1 tracking-widest mb-8 inline-block">
                   Inherited Schema: {selectedCategory().name}
                 </span>
                 <div class="grid grid-cols-2 gap-10">
                   <For each={allAttributes()}>
                     {(attr) => (
                       <div class="flex flex-col gap-2">
                         <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{attr.name}</label>
                         <Show when={attr.type === 'boolean'} fallback={
                           <Show when={attr.type === 'select'} fallback={
                             <input type={attr.type === 'number' ? 'number' : 'text'} class="w-full border-b border-black py-2 text-sm font-bold focus:outline-none font-mono"
                               value={formData().attributes[attr.name] || ''}
                               onInput={(e) => setFormData({...formData(), attributes: { ...formData().attributes, [attr.name]: e.target.value }})}
                             />
                           }>
                             <select class="w-full border-b border-black py-2 text-sm font-bold focus:outline-none bg-white font-mono"
                               value={formData().attributes[attr.name] || ''}
                               onChange={(e) => setFormData({...formData(), attributes: { ...formData().attributes, [attr.name]: e.target.value }})}>
                               <option value="">CHOOSE OPTION...</option>
                               <For each={attr.options}>{(opt) => <option value={opt}>{opt.toUpperCase()}</option>}</For>
                             </select>
                           </Show>
                         }> 
                           <select class="w-full border-b border-black py-2 text-sm font-bold focus:outline-none bg-white font-mono"
                              value={formData().attributes[attr.name]?.toString() || 'false'}
                              onChange={(e) => setFormData({...formData(), attributes: { ...formData().attributes, [attr.name]: e.target.value === 'true' }})}>
                              <option value="false">NO</option>
                              <option value="true">YES</option>
                           </select>
                         </Show>
                       </div>
                     )}
                   </For>
                 </div>
               </div>
             </Show>             
             <button type="submit" class="w-full bg-black text-white font-bold py-5 text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors mt-4">
               {view() === 'edit' ? 'Update Manifest' : 'Authorize Production'}
             </button>
          </div>
        </form>
      </Show>
    </div>
  );
}

function CategoryAdmin(props) {
  const [newCatName, setNewCatName] = createSignal("");
  const [parentId, setParentId] = createSignal("");
  const [addingAttrTo, setAddingAttrTo] = createSignal(null);
  const [newAttrData, setNewAttrData] = createSignal({ name: "", type: "string", displaySection: "top", options: "" });

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

  const handleAddAttribute = async (e) => {
    e.preventDefault();
    if (!addingAttrTo() || !newAttrData().name) return;
    try {
      const optionsArray = newAttrData().options.split(',').map(s => s.trim()).filter(Boolean);
      await api.post(`categories/${addingAttrTo()}/attributes`, { 
        json: { ...newAttrData(), options: optionsArray.length > 0 ? optionsArray : undefined } 
      });
      setAddingAttrTo(null);
      setNewAttrData({ name: "", type: "string", displaySection: "top", options: "" });
      props.onUpdate();
    } catch (err) { alert(err.message); }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm("Delete category? All products and subcategories will be removed!")) return;
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

  const handleUpdateAttribute = async (attr) => {
    const name = prompt("Enter new attribute name:", attr.name);
    if (!name) return;
    const displaySection = prompt("Enter display section (top or bottom):", attr.displaySection);
    if (displaySection !== 'top' && displaySection !== 'bottom') return alert("Invalid section");
    
    let options = attr.options;
    if (attr.type === 'select') {
      const opts = prompt("Enter options (comma separated):", attr.options?.join(', '));
      if (opts !== null) options = opts.split(',').map(s => s.trim()).filter(Boolean);
    }

    try {
      await api.patch(`categories/attributes/${attr.id}`, { json: { name, displaySection, options } });
      props.onUpdate();
    } catch (err) { alert(err.message); }
  };

  const handleDeleteAttribute = async (id) => {
    if (!confirm("Delete this property?")) return;
    try {
      await api.delete(`categories/attributes/${id}`);
      props.onUpdate();
    } catch (err) { alert(err.message); }
  };

  const handleToggleSection = async (attr) => {
    const displaySection = attr.displaySection === 'top' ? 'bottom' : 'top';
    try {
      await api.patch(`categories/attributes/${attr.id}`, { json: { displaySection } });
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
    <div class="font-mono">
      <div class="flex justify-between items-end mb-12">
        <h2 class="text-xl font-bold uppercase tracking-widest text-black leading-none">Schemas</h2>
        <form onSubmit={handleCreateCategory} class="flex gap-10 items-end">
          <div class="flex flex-col gap-2">
            <label class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Parent Context</label>
            <select class="border-b border-black py-2 text-sm font-bold focus:outline-none bg-white min-w-[180px]"
              value={parentId()} onChange={(e) => setParentId(e.target.value)}>
              <option value="">ROOT</option>
              <For each={props.categories}>{(cat) => <option value={cat.id}>{cat.name}</option>}</For>
            </select>
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Namespace</label>
            <input value={newCatName()} onInput={(e) => setNewCatName(e.target.value)} placeholder="NAME"
              class="border-b border-black py-2 text-sm font-bold focus:outline-none placeholder:text-gray-300 min-w-[240px]" />
          </div>
          <button type="submit" class="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800">Authorize</button>
        </form>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
        <For each={props.categories}>
          {(cat) => (
            <div class="p-8 border border-black bg-white">
               <div class="flex justify-between items-start border-b border-black pb-4 mb-2">
                 <div class="flex flex-col">
                   <Show when={cat.parentId}>
                     <span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">{getBreadcrumbs(cat)}</span>
                   </Show>
                   <div class="flex items-center gap-4">
                     <h3 class="text-lg font-bold text-black uppercase tracking-widest">{cat.name}</h3>
                     <button onClick={() => handleUpdateCategory(cat.id, cat.name)} class="text-[10px] font-bold uppercase text-gray-400 hover:text-black underline">Edit</button>
                   </div>
                 </div>
                 <button onClick={() => handleDeleteCategory(cat.id)} class="text-red-500 hover:underline uppercase text-[10px] font-bold">Delete</button>
               </div>
               
               <div class="space-y-2 mb-10 text-xs mt-6">
                 <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Properties</p>
                 <For each={cat.attributes}>
                   {(attr) => (
                     <div class="flex justify-between items-center py-3 border-b border-gray-100 last:border-0 font-bold group">
                       <div class="flex items-center gap-3">
                         <span class="uppercase">{attr.name}</span>
                         <div class="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                           <button onClick={() => handleUpdateAttribute(attr)} class="text-[9px] font-bold text-gray-400 hover:text-black underline">Manage</button>
                           <button onClick={() => handleDeleteAttribute(attr.id)} class="text-[9px] font-bold text-red-300 hover:text-red-600 underline">Delete</button>
                         </div>
                       </div>
                       <div class="flex gap-2">
                         <button onClick={() => handleToggleSection(attr)} class={cn("text-[9px] px-2 py-0.5 uppercase border", 
                             attr.displaySection === 'top' ? "bg-gray-100 border-transparent text-gray-600" : "bg-black border-black text-white")}>
                           {attr.displaySection}
                         </button>
                         <span class="text-[9px] px-2 py-0.5 border border-black uppercase text-black">{attr.type}</span>
                       </div>
                     </div>
                   )}
                 </For>
               </div>

               <Show when={addingAttrTo() === cat.id} fallback={
                 <button onClick={() => setAddingAttrTo(cat.id)} class="text-xs font-bold text-black uppercase hover:underline">+ Add Property</button>
               }>
                 <form onSubmit={handleAddAttribute} class="p-6 border border-black bg-gray-50">
                    <div class="flex flex-col gap-4">
                      <input placeholder="NAME" class="w-full text-sm border-b border-black py-2 font-bold focus:outline-none bg-transparent"
                        value={newAttrData().name} onInput={(e) => setNewAttrData({...newAttrData(), name: e.target.value})} />
                      <div class="grid grid-cols-2 gap-4">
                        <select class="w-full text-sm border-b border-black py-2 font-bold focus:outline-none bg-transparent"
                          value={newAttrData().type} onChange={(e) => setNewAttrData({...newAttrData(), type: e.target.value})}>
                          <option value="string">TEXT</option>
                          <option value="number">NUMBER</option>
                          <option value="boolean">YES/NO</option>
                          <option value="select">SELECT</option>
                        </select>
                        <select class="w-full text-sm border-b border-black py-2 font-bold focus:outline-none bg-transparent"
                          value={newAttrData().displaySection} onChange={(e) => setNewAttrData({...newAttrData(), displaySection: e.target.value})}>
                          <option value="top">TOP SECTION</option>
                          <option value="bottom">BOTTOM SECTION</option>
                        </select>
                      </div>
                      <Show when={newAttrData().type === 'select'}>
                        <input placeholder="OPTIONS (COMMA SEPARATED)" class="w-full text-sm border-b border-black py-2 font-bold focus:outline-none bg-transparent"
                          value={newAttrData().options} onInput={(e) => setNewAttrData({...newAttrData(), options: e.target.value})} />
                      </Show>
                      <div class="flex gap-4 mt-2">
                        <button type="submit" class="flex-1 bg-black text-white text-[10px] py-3 uppercase font-bold">Register</button>
                        <button type="button" onClick={() => setAddingAttrTo(null)} class="flex-1 border border-black text-black text-[10px] py-3 uppercase font-bold hover:bg-white">Abort</button>
                      </div>
                    </div>
                 </form>
               </Show>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

function BulkEditAdmin(props) {
  const [selectedAttr, setSelectedAttr] = createSignal(null);
  const [uniqueValues] = createResource(selectedAttr, async (id) => {
    if (!id) return [];
    return await api.get(`categories/attributes/${id}/values`).json();
  });

  return (
    <div class="font-mono">
      <h2 class="text-xl font-bold uppercase tracking-widest text-black mb-12 leading-none">Property Editor</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-16">
        <div class="flex flex-col gap-4">
           <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">1. Select Property</label>
           <select class="w-full py-4 border-b-2 border-black bg-white text-sm font-bold focus:outline-none"
             onChange={(e) => setSelectedAttr(e.target.value)}>
             <option value="">CHOOSE...</option>
             <For each={props.categories}>
               {(cat) => (
                 <optgroup label={cat.name}>
                    <For each={cat.attributes}>
                      {(attr) => <option value={attr.id}>{cat.name}: {attr.name}</option>}
                    </For>
                 </optgroup>
               )}
             </For>
           </select>
        </div>

        <div class="md:col-span-2">
           <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">2. Values Archive</label>
           <div class="mt-8 border border-black">
              <Show when={uniqueValues.loading}>
                 <div class="p-12 text-center text-gray-400 text-xs uppercase animate-pulse">Scanning...</div>
              </Show>
              <Show when={!selectedAttr()}>
                 <div class="p-12 text-center text-gray-400 text-xs uppercase italic">Select property to begin.</div>
              </Show>
              <Show when={selectedAttr() && !uniqueValues.loading}>
                <table class="w-full text-left text-sm">
                  <thead class="bg-black text-white uppercase font-bold text-[10px] tracking-widest">
                    <tr>
                      <th class="px-6 py-4">Value</th>
                      <th class="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={uniqueValues()}>
                      {(val) => (
                        <tr class="border-b border-gray-200 hover:bg-gray-50 transition-colors font-bold">
                          <td class="px-6 py-5 text-black uppercase">{val}</td>
                          <td class="px-6 py-5 text-right">
                             <button onClick={() => {
                                 const newValue = prompt(`RENAME "${val}" TO:`, val);
                                 if (newValue && newValue !== val) {
                                   api.patch(`categories/attributes/${selectedAttr()}/values`, { 
                                     json: { oldValue: val, newValue } 
                                   }).then(() => alert('AUTHORIZED!'));
                                 }
                               }} class="text-black hover:underline uppercase text-[10px] font-bold">Rename</button>
                          </td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </Show>
           </div>
        </div>
      </div>
    </div>
  );
}
