import { Show } from "solid-js";
import { X } from "lucide-solid";
import { Portal } from "solid-js/web";

export function Modal(props) {
  return (
    <Show when={props.isOpen}>
      <Portal>
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            class="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity" 
            onClick={props.onClose}
          />
          
          <div class="relative w-full max-w-lg bg-white rounded-xl shadow-2xl transform transition-all animate-in zoom-in-95 duration-200">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 class="text-lg font-semibold text-gray-900">{props.title}</h3>
              <button 
                onClick={props.onClose}
                class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <div class="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {props.children}
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  );
}
