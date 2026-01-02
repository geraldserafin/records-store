import { createSignal, For, Show } from "solid-js";
import { cn } from "../../lib/utils";

const CategoryItem = (props) => {
  const [expanded, setExpanded] = createSignal(false);
  const hasChildren = () => props.category.children && props.category.children.length > 0;

  const handleExpand = (e) => {
    e.stopPropagation();
    setExpanded(!expanded());
  };

  return (
    <div class="mb-2">
      <div 
        class={cn(
          "flex items-center justify-between cursor-pointer group",
          props.selectedCategory === props.category.id ? "text-black" : "text-gray-400 hover:text-black"
        )}
        onClick={() => props.onSelect(props.category.id)}
      >
        <span class={cn(
          "uppercase text-xs tracking-widest transition-colors",
          props.selectedCategory === props.category.id ? "font-bold border-b border-black" : "font-medium"
        )}>
          {props.category.name}
        </span>
        <Show when={hasChildren()}>
          <button 
            onClick={handleExpand}
            class="text-xs px-2"
          >
             {expanded() ? '−' : '+'}
          </button>
        </Show>
      </div>
      <Show when={hasChildren() && expanded()}>
        <div class="ml-4 mt-2 border-l border-gray-200 pl-4">
           <For each={props.category.children}>
             {child => (
               <CategoryItem 
                 category={child} 
                 selectedCategory={props.selectedCategory} 
                 onSelect={props.onSelect} 
               />
             )}
           </For>
        </div>
      </Show>
    </div>
  );
};

export default function CategorySidebar(props) {
  const buildTree = (cats) => {
    if (!cats) return [];
    const map = {};
    const roots = [];
    
    // Deep clone to avoid mutating original
    const categories = JSON.parse(JSON.stringify(cats));

    categories.forEach(cat => {
      map[cat.id] = { ...cat, children: [] };
    });

    categories.forEach(cat => {
      if (cat.parentId && map[cat.parentId]) {
        map[cat.parentId].children.push(map[cat.id]);
      } else {
        roots.push(map[cat.id]);
      }
    });
    return roots;
  };

  const tree = () => buildTree(props.categories);

  return (
    <div class="sticky top-24 pr-8">
      <h3 class="text-xs font-bold uppercase tracking-widest mb-6 text-black">Filter</h3>
      
      <div class="space-y-3">
        <div 
          class={cn(
            "cursor-pointer uppercase text-xs tracking-widest mb-4",
            props.selectedCategory === null 
              ? "text-black font-bold border-b border-black inline-block" 
              : "text-gray-400 hover:text-black"
          )}
          onClick={() => props.onSelect(null)}
        >
          All
        </div>
        
        <For each={tree()}>
          {root => (
            <CategoryItem 
              category={root} 
              selectedCategory={props.selectedCategory} 
              onSelect={props.onSelect} 
            />
          )}
        </For>
      </div>
    </div>
  );
}
