import { createSignal, createResource, For, Show } from "solid-js";
import { api } from "../lib/api";
import { fetchProducts } from "../features/products/products.api";
import { Plus, X, Trash2 } from "lucide-solid";
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
           <TabButton 
             active={activeTab() === "bulk"} 
             onClick={() => setActiveTab("bulk")}
             label="FIX ALL"
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
      attributes: {}
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
      
      alert(view() === "edit" ? 'FIXED!' : 'BORN!');
      setView("list");
      refetch();
    } catch (err) { alert(err.message); }
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
                 <label class="font-bold uppercase">GROUP</label>
                 <select required class="border-2 border-black p-2 bg-[#f9f9f9]"
                   value={formData().categoryId} onChange={(e) => setFormData({...formData(), categoryId: e.target.value, attributes: {} }) }>
                   <option value="">WHICH GROUP?</option>
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

             <Show when={selectedCategory()}>
               <div class="pt-4 border-t-2 border-black">
                 <span class="bg-black text-white px-2 font-bold uppercase mb-4 inline-block">
                   EXTRA INFO ({selectedCategory().name})
                 </span>
                 <div class="grid grid-cols-2 gap-4">
                   <For each={allAttributes()}>
                     {(attr) => (
                       <div class="flex flex-col">
                         <label class="font-bold uppercase">{attr.name}</label>
                         <Show when={attr.type === 'boolean'} fallback={
                           <Show when={attr.type === 'select'} fallback={
                             <input type={attr.type === 'number' ? 'number' : 'text'} class="border-2 border-black p-2 bg-[#f9f9f9]"
                               value={formData().attributes[attr.name] || ''}
                               onInput={(e) => setFormData({...formData(), attributes: { ...formData().attributes, [attr.name]: e.target.value }})}
                             />
                           }>
                             <select class="border-2 border-black p-2 bg-[#f9f9f9]"
                               value={formData().attributes[attr.name] || ''}
                               onChange={(e) => setFormData({...formData(), attributes: { ...formData().attributes, [attr.name]: e.target.value }})}>
                               <option value="">PICK...</option>
                               <For each={attr.options}>{(opt) => <option value={opt}>{opt.toUpperCase()}</option>}</For>
                             </select>
                           </Show>
                         }> 
                           <select class="border-2 border-black p-2 bg-[#f9f9f9]"
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
             <button type="submit" class="w-full bg-[var(--retro-green)] font-bold py-4 uppercase border-4 border-black hover:bg-black hover:text-white">
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

  const handleUpdateAttribute = async (attr) => {
    const name = prompt("New name?", attr.name);
    if (!name) return;
    const displaySection = prompt("Where? (top or bottom):", attr.displaySection);
    if (displaySection !== 'top' && displaySection !== 'bottom') return alert("BAD PLACE");
    
    let options = attr.options;
    if (attr.type === 'select') {
      const opts = prompt("Options? (a, b, c):", attr.options?.join(', '));
      if (opts !== null) options = opts.split(',').map(s => s.trim()).filter(Boolean);
    }

    try {
      await api.patch(`categories/attributes/${attr.id}`, { json: { name, displaySection, options } });
      props.onUpdate();
    } catch (err) { alert(err.message); }
  };

  const handleDeleteAttribute = async (id) => {
    if (!confirm("Delete this?")) return;
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
               <div class="flex justify-between items-start border-b-2 border-black pb-2 mb-4">
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
               
               <div class="space-y-2 mb-4">
                 <p class="font-bold uppercase opacity-50">PROPERTIES:</p>
                 <For each={cat.attributes}>
                   {(attr) => (
                     <div class="flex justify-between items-center p-2 border-2 border-dashed border-black bg-[#fafafa]">
                       <div class="flex items-center gap-2">
                         <span class="font-bold uppercase">{attr.name}</span>
                         <button onClick={() => handleUpdateAttribute(attr)} class="bg-white px-1 border border-black font-bold uppercase">?</button>
                         <button onClick={() => handleDeleteAttribute(attr.id)} class="bg-[var(--retro-red)] text-white px-1 border border-black font-bold uppercase">X</button>
                       </div>
                       <div class="flex gap-1">
                         <button onClick={() => handleToggleSection(attr)} class={cn("px-2 border border-black font-bold uppercase", 
                             attr.displaySection === 'top' ? "bg-[var(--retro-orange)]" : "bg-[var(--retro-purple)] text-white")}>
                           {attr.displaySection}
                         </button>
                         <span class="px-2 border border-black font-bold uppercase bg-white">{attr.type}</span>
                       </div>
                     </div>
                   )}
                 </For>
               </div>

               <Show when={addingAttrTo() === cat.id} fallback={
                 <button onClick={() => setAddingAttrTo(cat.id)} class="w-full bg-[var(--retro-yellow)] py-2 border-2 border-black font-bold uppercase">+ ADD PROPERTY</button>
               }>
                 <form onSubmit={handleAddAttribute} class="p-4 border-2 border-black bg-[#f9f9f9] space-y-4">
                    <div class="flex flex-col">
                      <label class="font-bold uppercase">NAME</label>
                      <input placeholder="NAME" class="border-2 border-black p-2 bg-white"
                        value={newAttrData().name} onInput={(e) => setNewAttrData({...newAttrData(), name: e.target.value})} />
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                      <select class="border-2 border-black p-2 bg-white"
                        value={newAttrData().type} onChange={(e) => setNewAttrData({...newAttrData(), type: e.target.value})}>
                        <option value="string">TEXT</option>
                        <option value="number">NUMBER</option>
                        <option value="boolean">YES/NO</option>
                        <option value="select">SELECT</option>
                      </select>
                      <select class="border-2 border-black p-2 bg-white"
                        value={newAttrData().displaySection} onChange={(e) => setNewAttrData({...newAttrData(), displaySection: e.target.value})}>
                        <option value="top">TOP</option>
                        <option value="bottom">BOTTOM</option>
                      </select>
                    </div>
                    <Show when={newAttrData().type === 'select'}>
                      <input placeholder="A, B, C" class="border-2 border-black p-2 bg-white"
                        value={newAttrData().options} onInput={(e) => setNewAttrData({...newAttrData(), options: e.target.value})} />
                    </Show>
                    <div class="flex gap-2">
                      <button type="submit" class="flex-1 bg-[var(--retro-green)] py-2 border-2 border-black font-bold uppercase">SAVE</button>
                      <button type="button" onClick={() => setAddingAttrTo(null)} class="flex-1 bg-[var(--retro-red)] text-white py-2 border-2 border-black font-bold uppercase">STOP</button>
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
    <div>
      <h2 class="font-bold uppercase bg-[var(--retro-purple)] text-white px-2 py-1 border-2 border-black mb-8 inline-block">FIX ALL VALUES</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="flex flex-col gap-2">
           <label class="font-bold uppercase">1. WHICH ONE?</label>
           <select class="border-4 border-black p-4 bg-white font-bold"
             onChange={(e) => setSelectedAttr(e.target.value)}>
             <option value="">PICK...</option>
             <For each={props.categories}>
               {(cat) => (
                 <optgroup label={cat.name}>
                    <For each={cat.attributes}>
                      {(attr) => <option value={attr.id}>{cat.name} -> {attr.name}</option>}
                    </For>
                 </optgroup>
               )}
             </For>
           </select>
        </div>

        <div class="md:col-span-2">
           <label class="font-bold uppercase">2. LIST OF EVERYTHING</label>
           <div class="mt-4 border-4 border-black bg-white">
              <Show when={uniqueValues.loading}>
                 <div class="p-8 text-center animate-bounce font-bold">LOOKING...</div>
              </Show>
              <Show when={!selectedAttr()}>
                 <div class="p-8 text-center italic opacity-50 font-bold">NOTHING SELECTED.</div>
              </Show>
              <Show when={selectedAttr() && !uniqueValues.loading}>
                <table class="w-full text-left">
                  <thead class="bg-black text-white uppercase font-bold">
                    <tr>
                      <th class="p-4 border-r-2 border-black">VALUE</th>
                      <th class="p-4 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={uniqueValues()}>
                      {(val) => (
                        <tr class="border-b-2 border-black font-bold">
                          <td class="p-4 border-r-2 border-black uppercase bg-[#fafafa]">{val}</td>
                          <td class="p-4 text-right">
                             <button onClick={() => {
                                 const newValue = prompt(`NEW NAME FOR "${val}"?`, val);
                                 if (newValue && newValue !== val) {
                                   api.patch(`categories/attributes/${selectedAttr()}/values`, { 
                                     json: { oldValue: val, newValue } 
                                   }).then(() => alert('DONE!'));
                                 }
                               }} class="bg-[var(--retro-blue)] text-white px-4 py-2 border-2 border-black font-bold uppercase">RENAME</button>
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
