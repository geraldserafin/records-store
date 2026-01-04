import { Plus } from "lucide-solid";

export function PageHeader(props) {
  return (
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">{props.title}</h1>
        <p class="text-sm text-gray-500 mt-1">{props.description}</p>
      </div>
      
      {props.action && (
        <button
          onClick={props.action.onClick}
          class="flex items-center gap-2 bg-black text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-800 transition-colors shadow-sm"
        >
          <Plus size={16} />
          {props.action.label}
        </button>
      )}
    </div>
  );
}
